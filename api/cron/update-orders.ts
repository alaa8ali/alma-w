import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Cron Job: Update Order Status
 * This endpoint is called periodically to update order statuses
 * Configure in Vercel: https://vercel.com/docs/crons
 * 
 * Example cron configuration in vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-orders",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify the request is from Vercel
  if (req.headers['x-vercel-cron'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all pending orders that should be confirmed
    const { data: pendingOrders, error: pendingError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 5 * 60000).toISOString()); // Orders older than 5 minutes

    if (pendingError) {
      throw pendingError;
    }

    let updatedCount = 0;

    // Update pending orders to confirmed if payment is paid
    for (const order of pendingOrders || []) {
      if (order.payment_status === 'paid') {
        await supabase
          .from('orders')
          .update({ status: 'confirmed' })
          .eq('id', order.id);

        updatedCount++;

        // Send notification
        await supabase.from('notifications').insert([
          {
            user_id: order.user_id,
            type: 'order',
            title: 'Order Confirmed',
            message: `Your order #${order.order_number} has been confirmed and is being prepared.`,
            data: { orderId: order.id },
          },
        ]);
      }
    }

    // Get all orders that should be marked as ready
    const { data: preparingOrders, error: preparingError } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'preparing')
      .lt('created_at', new Date(Date.now() - 30 * 60000).toISOString()); // Orders being prepared for 30 minutes

    if (preparingError) {
      throw preparingError;
    }

    // Update preparing orders to ready
    for (const order of preparingOrders || []) {
      await supabase
        .from('orders')
        .update({ status: 'ready' })
        .eq('id', order.id);

      updatedCount++;

      // Send notification
      await supabase.from('notifications').insert([
        {
          user_id: order.user_id,
          type: 'order',
          title: 'Order Ready',
          message: `Your order #${order.order_number} is ready for pickup/delivery.`,
          data: { orderId: order.id },
        },
      ]);
    }

    return res.status(200).json({
      success: true,
      message: 'Order statuses updated successfully',
      updatedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return res.status(500).json({
      error: 'Cron job failed',
      message: error.message,
    });
  }
}
