import { supabase } from './supabaseClient';

export interface Trip {
  id: string;
  userId: string;
  driverId?: string;
  pickupLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoffLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  fare: number;
  distance: number;
  estimatedDuration: number;
  actualDuration?: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  paymentStatus: 'pending' | 'paid' | 'failed';
  rating?: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripsResponse {
  success: boolean;
  data: Trip[];
  total: number;
}

export const tripService = {
  // Request a trip
  requestTrip: async (tripData: Partial<Trip>): Promise<Trip | null> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('trips')
        .insert([
          {
            user_id: sessionData.session.user.id,
            ...tripData,
            status: 'pending',
            payment_status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Trip;
    } catch (error: any) {
      console.error('Error requesting trip:', error);
      return null;
    }
  },

  // Get trip by ID
  getTripById: async (tripId: string): Promise<Trip | null> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', tripId)
        .single();

      if (error) {
        throw error;
      }

      return data as Trip;
    } catch (error: any) {
      console.error('Error fetching trip:', error);
      return null;
    }
  },

  // Get user trips
  getUserTrips: async (page = 1, limit = 10): Promise<TripsResponse> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        return {
          success: false,
          data: [],
          total: 0,
        };
      }

      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('trips')
        .select('*', { count: 'exact' })
        .eq('user_id', sessionData.session.user.id)
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Trip[],
        total: count || 0,
      };
    } catch (error: any) {
      console.error('Error fetching user trips:', error);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
  },

  // Get driver trips
  getDriverTrips: async (driverId: string, page = 1, limit = 10): Promise<TripsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('trips')
        .select('*', { count: 'exact' })
        .eq('driver_id', driverId)
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Trip[],
        total: count || 0,
      };
    } catch (error: any) {
      console.error('Error fetching driver trips:', error);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
  },

  // Accept trip (driver)
  acceptTrip: async (tripId: string, driverId: string): Promise<Trip | null> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          driver_id: driverId,
          status: 'accepted',
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Trip;
    } catch (error: any) {
      console.error('Error accepting trip:', error);
      return null;
    }
  },

  // Start trip (driver)
  startTrip: async (tripId: string): Promise<Trip | null> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          status: 'in_progress',
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Trip;
    } catch (error: any) {
      console.error('Error starting trip:', error);
      return null;
    }
  },

  // Complete trip (driver)
  completeTrip: async (tripId: string): Promise<Trip | null> => {
    try {
      const trip = await tripService.getTripById(tripId);
      if (!trip) {
        throw new Error('Trip not found');
      }

      const actualDuration = Math.floor(
        (new Date().getTime() - new Date(trip.createdAt).getTime()) / 60000
      );

      const { data, error } = await supabase
        .from('trips')
        .update({
          status: 'completed',
          actual_duration: actualDuration,
          payment_status: 'pending',
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Trip;
    } catch (error: any) {
      console.error('Error completing trip:', error);
      return null;
    }
  },

  // Cancel trip
  cancelTrip: async (tripId: string): Promise<Trip | null> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          status: 'cancelled',
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Trip;
    } catch (error: any) {
      console.error('Error cancelling trip:', error);
      return null;
    }
  },

  // Rate trip
  rateTrip: async (tripId: string, rating: number, comment?: string): Promise<Trip | null> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          rating,
          comment,
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Trip;
    } catch (error: any) {
      console.error('Error rating trip:', error);
      return null;
    }
  },

  // Get pending trips (for drivers)
  getPendingTrips: async (): Promise<Trip[]> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('status', 'pending')
        .order('createdAt', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Trip[];
    } catch (error: any) {
      console.error('Error fetching pending trips:', error);
      return [];
    }
  },

  // Update trip status
  updateTripStatus: async (tripId: string, status: string): Promise<Trip | null> => {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({ status })
        .eq('id', tripId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Trip;
    } catch (error: any) {
      console.error('Error updating trip status:', error);
      return null;
    }
  },

  // Get trip statistics
  getTripStatistics: async (userId: string) => {
    try {
      const { data: trips, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const completedTrips = (trips as Trip[]).filter((t) => t.status === 'completed');
      const totalDistance = completedTrips.reduce((sum, t) => sum + t.distance, 0);
      const totalFare = completedTrips.reduce((sum, t) => sum + t.fare, 0);
      const averageRating =
        completedTrips.filter((t) => t.rating).reduce((sum, t) => sum + (t.rating || 0), 0) /
        completedTrips.filter((t) => t.rating).length || 0;

      return {
        totalTrips: trips.length,
        completedTrips: completedTrips.length,
        totalDistance,
        totalFare,
        averageRating,
      };
    } catch (error: any) {
      console.error('Error fetching trip statistics:', error);
      return null;
    }
  },
};
