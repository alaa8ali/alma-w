import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Payment Webhook Handler
 * This endpoint handles payment confirmation webhooks from payment providers
 * (e.g., Stripe, PayPal, etc.)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, paymentId, status, amount, provider } = req.body;

    // Validate webhook signature (implement based on your payment provider)
    // Example: verify Stripe signature
    // const signature = req.headers['stripe-signature'];
    // if (!verifyStripeSignature(signature, req.body)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }

    if (!orderId || !status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update order payment status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: status === 'success' ? 'paid' : 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      console.error('Error updating order:', orderError);
      return res.status(500).json({ error: 'Failed to update order' });
    }

    // If payment successful, update order status to confirmed
    if (status === 'success') {
      await supabase
        .from('orders')
        .update({ status: 'confirmed' })
        .eq('id', orderId);

      // Create notification for user
      await supabase.from('notifications').insert([
        {
          user_id: order.user_id,
          type: 'order',
          title: 'Payment Confirmed',
          message: `Your payment for order #${order.order_number} has been confirmed. Your order is being prepared.`,
          data: { orderId, paymentId },
        },
      ]);
    } else {
      // Create notification for failed payment
      await supabase.from('notifications').insert([
        {
          user_id: order.user_id,
          type: 'order',
          title: 'Payment Failed',
          message: `Payment for order #${order.order_number} failed. Please try again.`,
          data: { orderId, paymentId },
        },
      ]);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment webhook processed successfully',
      orderId,
      status,
    });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
    });
  }
}
