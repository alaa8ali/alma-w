import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Cron Job: Update Trip Status
 * This endpoint is called periodically to update trip statuses and driver earnings
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verify the request is from Vercel
  if (req.headers['x-vercel-cron'] !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get all pending trips that haven't been accepted for 5 minutes
    const { data: pendingTrips, error: pendingError } = await supabase
      .from('trips')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 5 * 60000).toISOString());

    if (pendingError) {
      throw pendingError;
    }

    let cancelledCount = 0;

    // Cancel pending trips that haven't been accepted
    for (const trip of pendingTrips || []) {
      await supabase
        .from('trips')
        .update({ status: 'cancelled' })
        .eq('id', trip.id);

      cancelledCount++;

      // Send notification to user
      await supabase.from('notifications').insert([
        {
          user_id: trip.user_id,
          type: 'delivery',
          title: 'Trip Cancelled',
          message: 'No drivers were available for your trip. Please try again.',
          data: { tripId: trip.id },
        },
      ]);
    }

    // Get all in-progress trips that should be marked as completed
    // (This is a simple example - in production, you'd check actual location data)
    const { data: inProgressTrips, error: inProgressError } = await supabase
      .from('trips')
      .select('*')
      .eq('status', 'in_progress')
      .lt('created_at', new Date(Date.now() - 60 * 60000).toISOString()); // Trips in progress for 1 hour

    if (inProgressError) {
      throw inProgressError;
    }

    let completedCount = 0;

    // Complete in-progress trips
    for (const trip of inProgressTrips || []) {
      const actualDuration = Math.floor(
        (new Date().getTime() - new Date(trip.created_at).getTime()) / 60000
      );

      await supabase
        .from('trips')
        .update({
          status: 'completed',
          actual_duration: actualDuration,
          payment_status: 'pending',
        })
        .eq('id', trip.id);

      completedCount++;

      // Update driver earnings
      if (trip.driver_id) {
        await supabase
          .from('drivers')
          .update({
            total_earnings: trip.fare,
            total_trips: 1,
          })
          .eq('id', trip.driver_id);
      }

      // Send notification to user
      await supabase.from('notifications').insert([
        {
          user_id: trip.user_id,
          type: 'delivery',
          title: 'Trip Completed',
          message: `Your trip has been completed. Total fare: ${trip.fare}`,
          data: { tripId: trip.id, fare: trip.fare },
        },
      ]);
    }

    return res.status(200).json({
      success: true,
      message: 'Trip statuses updated successfully',
      cancelledCount,
      completedCount,
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
