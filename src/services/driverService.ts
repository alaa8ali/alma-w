import { supabase } from './supabaseClient';

export interface Driver {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  avatar?: string;
  vehicleType: string;
  vehicleNumber: string;
  licensePlate: string;
  rating: number;
  reviewCount: number;
  is_active: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  totalTrips: number;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface DriversResponse {
  success: boolean;
  data: Driver[];
  total: number;
}

export const driverService = {
  // Get available drivers
  getAvailableDrivers: async (location?: { lat: number; lng: number }): Promise<Driver[]> => {
    try {
      let query = supabase
        .from('drivers')
        .select('*, driver_locations(*)')
        .eq('is_active', true);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // Filter by distance if location is provided
      if (location) {
        return (data as any[]).filter((driver) => {
          if (!driver.driver_locations) return false;
          const distance = calculateDistance(
            location.lat,
            location.lng,
            driver.driver_locations.lat,
            driver.driver_locations.lng
          );
          return distance <= 5; // 5 km radius
        });
      }

      return data as Driver[];
    } catch (error: any) {
      console.error('Error fetching available drivers:', error);
      return [];
    }
  },

  // Get driver by ID
  getDriverById: async (driverId: string): Promise<Driver | null> => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*, driver_locations(*)')
        .eq('id', driverId)
        .single();

      if (error) {
        throw error;
      }

      return data as Driver;
    } catch (error: any) {
      console.error('Error fetching driver:', error);
      return null;
    }
  },

  // Get all drivers (admin only)
  getAllDrivers: async (page = 1, limit = 20): Promise<DriversResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('drivers')
        .select('*', { count: 'exact' })
        .order('rating', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Driver[],
        total: count || 0,
      };
    } catch (error: any) {
      console.error('Error fetching drivers:', error);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
  },

  // Create driver (admin only)
  createDriver: async (driverData: Partial<Driver>): Promise<Driver | null> => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert([driverData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Driver;
    } catch (error: any) {
      console.error('Error creating driver:', error);
      return null;
    }
  },

  // Update driver
  updateDriver: async (driverId: string, driverData: Partial<Driver>): Promise<Driver | null> => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update(driverData)
        .eq('id', driverId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Driver;
    } catch (error: any) {
      console.error('Error updating driver:', error);
      return null;
    }
  },

  // Update driver location
  updateDriverLocation: async (
    driverId: string,
    location: { lat: number; lng: number }
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('driver_locations')
        .upsert({ driver_id: driverId, lat: location.lat, lng: location.lng }, { onConflict: 'driver_id' });

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error updating driver location:', error);
      return false;
    }
  },

  // Set driver availability
  setDriverAvailability: async (driverId: string, is_active: boolean): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_active })
        .eq('id', driverId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error setting driver availability:', error);
      return false;
    }
  },

  // Delete driver (admin only)
  deleteDriver: async (driverId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', driverId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting driver:', error);
      return false;
    }
  },

  // Get driver stats
  getDriverStats: async (driverId: string) => {
    try {
      const driver = await driverService.getDriverById(driverId);
      if (!driver) {
        return null;
      }

      return {
        totalTrips: driver.totalTrips,
        totalEarnings: driver.totalEarnings,
        rating: driver.rating,
        reviewCount: driver.reviewCount,
        averageEarningsPerTrip: driver.totalEarnings / driver.totalTrips || 0,
      };
    } catch (error: any) {
      console.error('Error fetching driver stats:', error);
      return null;
    }
  },
};

// Helper function to calculate distance between two coordinates
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
