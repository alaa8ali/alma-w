import { supabase } from './supabaseClient';

export interface ServiceRequest {
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

export interface ServiceRequestsResponse {
  success: boolean;
  data: ServiceRequest[];
  total: number;
}

export const serviceRequestService = {
  // Request a serviceRequest
  requestServiceRequest: async (serviceRequestData: Partial<ServiceRequest>): Promise<ServiceRequest | null> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('service_requests')
        .insert([
          {
            user_id: sessionData.session.user.id,
            ...serviceRequestData,
            status: 'pending',
            payment_status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ServiceRequest;
    } catch (error: any) {
      console.error('Error requesting serviceRequest:', error);
      return null;
    }
  },

  // Get serviceRequest by ID
  getServiceRequestById: async (serviceRequestId: string): Promise<ServiceRequest | null> => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('id', serviceRequestId)
        .single();

      if (error) {
        throw error;
      }

      return data as ServiceRequest;
    } catch (error: any) {
      console.error('Error fetching serviceRequest:', error);
      return null;
    }
  },

  // Get user serviceRequests
  getUserServiceRequests: async (page = 1, limit = 10): Promise<ServiceRequestsResponse> => {
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
        .from('service_requests')
        .select('*', { count: 'exact' })
        .eq('user_id', sessionData.session.user.id)
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as ServiceRequest[],
        total: count || 0,
      };
    } catch (error: any) {
      console.error('Error fetching user serviceRequests:', error);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
  },

  // Get driver serviceRequests
  getDriverServiceRequests: async (driverId: string, page = 1, limit = 10): Promise<ServiceRequestsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('service_requests')
        .select('*', { count: 'exact' })
        .eq('driver_id', driverId)
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as ServiceRequest[],
        total: count || 0,
      };
    } catch (error: any) {
      console.error('Error fetching driver serviceRequests:', error);
      return {
        success: false,
        data: [],
        total: 0,
      };
    }
  },

  // Accept serviceRequest (driver)
  acceptServiceRequest: async (serviceRequestId: string, driverId: string): Promise<ServiceRequest | null> => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({
          driver_id: driverId,
          status: 'accepted',
        })
        .eq('id', serviceRequestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ServiceRequest;
    } catch (error: any) {
      console.error('Error accepting serviceRequest:', error);
      return null;
    }
  },

  // Start serviceRequest (driver)
  startServiceRequest: async (serviceRequestId: string): Promise<ServiceRequest | null> => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({
          status: 'in_progress',
        })
        .eq('id', serviceRequestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ServiceRequest;
    } catch (error: any) {
      console.error('Error starting serviceRequest:', error);
      return null;
    }
  },

  // Complete serviceRequest (driver)
  completeServiceRequest: async (serviceRequestId: string): Promise<ServiceRequest | null> => {
    try {
      const serviceRequest = await serviceRequestService.getServiceRequestById(serviceRequestId);
      if (!serviceRequest) {
        throw new Error('ServiceRequest not found');
      }

      const actualDuration = Math.floor(
        (new Date().getTime() - new Date(serviceRequest.createdAt).getTime()) / 60000
      );

      const { data, error } = await supabase
        .from('service_requests')
        .update({
          status: 'completed',
          actual_duration: actualDuration,
          payment_status: 'pending',
        })
        .eq('id', serviceRequestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ServiceRequest;
    } catch (error: any) {
      console.error('Error completing serviceRequest:', error);
      return null;
    }
  },

  // Cancel serviceRequest
  cancelServiceRequest: async (serviceRequestId: string): Promise<ServiceRequest | null> => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({
          status: 'cancelled',
        })
        .eq('id', serviceRequestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ServiceRequest;
    } catch (error: any) {
      console.error('Error cancelling serviceRequest:', error);
      return null;
    }
  },

  // Rate serviceRequest
  rateServiceRequest: async (serviceRequestId: string, rating: number, comment?: string): Promise<ServiceRequest | null> => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({
          rating,
          comment,
        })
        .eq('id', serviceRequestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ServiceRequest;
    } catch (error: any) {
      console.error('Error rating serviceRequest:', error);
      return null;
    }
  },

  // Get pending serviceRequests (for drivers)
  getPendingServiceRequests: async (): Promise<ServiceRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('status', 'pending')
        .order('createdAt', { ascending: true });

      if (error) {
        throw error;
      }

      return data as ServiceRequest[];
    } catch (error: any) {
      console.error('Error fetching pending serviceRequests:', error);
      return [];
    }
  },

  // Update serviceRequest status
  updateServiceRequestStatus: async (serviceRequestId: string, status: string): Promise<ServiceRequest | null> => {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .update({ status })
        .eq('id', serviceRequestId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as ServiceRequest;
    } catch (error: any) {
      console.error('Error updating serviceRequest status:', error);
      return null;
    }
  },

  // Get serviceRequest statistics
  getServiceRequestStatistics: async (userId: string) => {
    try {
      const { data: serviceRequests, error } = await supabase
        .from('service_requests')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      const completedServiceRequests = (serviceRequests as ServiceRequest[]).filter((t) => t.status === 'completed');
      const totalDistance = completedServiceRequests.reduce((sum, t) => sum + t.distance, 0);
      const totalFare = completedServiceRequests.reduce((sum, t) => sum + t.fare, 0);
      const averageRating =
        completedServiceRequests.filter((t) => t.rating).reduce((sum, t) => sum + (t.rating || 0), 0) /
        completedServiceRequests.filter((t) => t.rating).length || 0;

      return {
        totalServiceRequests: serviceRequests.length,
        completedServiceRequests: completedServiceRequests.length,
        totalDistance,
        totalFare,
        averageRating,
      };
    } catch (error: any) {
      console.error('Error fetching serviceRequest statistics:', error);
      return null;
    }
  },
};
