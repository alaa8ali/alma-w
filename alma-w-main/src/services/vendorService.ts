import { supabase } from './supabaseClient';
import { Branch, VerticalType } from '@types/index';

export interface BranchsResponse {
  success: boolean;
  data: Branch[];
  total: number;
  page: number;
  limit: number;
}

export const branchService = {
  // Get all branches
  getBranchs: async (page = 1, limit = 20): Promise<BranchsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('branches')
        .select('*', { count: 'exact' })
        .order('rating', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Branch[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching branches:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Get vendor by ID
  getBranchById: async (branchId: string): Promise<Branch | null> => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .eq('id', branchId)
        .single();

      if (error) {
        throw error;
      }

      return data as Branch;
    } catch (error: any) {
      console.error('Error fetching vendor:', error);
      return null;
    }
  },

  // Get branches by vertical
  getBranchsByVertical: async (vertical: VerticalType, page = 1, limit = 20): Promise<BranchsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('branches')
        .select('*', { count: 'exact' })
        .eq('vertical', vertical)
        .order('rating', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Branch[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching branches by vertical:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Get featured branches
  getFeaturedBranchs: async (vertical?: VerticalType): Promise<Branch[]> => {
    try {
      let query = supabase
        .from('branches')
        .select('*')
        .eq('featured', true)
        .eq('isOpen', true);

      if (vertical) {
        query = query.eq('vertical', vertical);
      }

      const { data, error } = await query.order('rating', { ascending: false }).limit(10);

      if (error) {
        throw error;
      }

      return data as Branch[];
    } catch (error: any) {
      console.error('Error fetching featured branches:', error);
      return [];
    }
  },

  // Search branches
  searchBranchs: async (query: string): Promise<Branch[]> => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(20);

      if (error) {
        throw error;
      }

      return data as Branch[];
    } catch (error: any) {
      console.error('Error searching branches:', error);
      return [];
    }
  },

  // Create vendor (admin only)
  createBranch: async (vendorData: Partial<Branch>): Promise<Branch | null> => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .insert([vendorData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Branch;
    } catch (error: any) {
      console.error('Error creating vendor:', error);
      return null;
    }
  },

  // Update vendor
  updateBranch: async (branchId: string, vendorData: Partial<Branch>): Promise<Branch | null> => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .update(vendorData)
        .eq('id', branchId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Branch;
    } catch (error: any) {
      console.error('Error updating vendor:', error);
      return null;
    }
  },

  // Delete vendor (admin only)
  deleteBranch: async (branchId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('branches').delete().eq('id', branchId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting vendor:', error);
      return false;
    }
  },

  // Get vendor statistics
  getBranchStats: async (branchId: string) => {
    try {
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('branch_id', branchId);

      if (ordersError) {
        throw ordersError;
      }

      const completedOrders = (orders as any[]).filter((o) => o.status === 'delivered');
      const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
      const totalOrders = orders.length;
      const pendingOrders = (orders as any[]).filter((o) => o.status === 'pending').length;

      return {
        totalOrders,
        totalRevenue,
        averageOrderValue: totalRevenue / completedOrders.length || 0,
        pendingOrders,
        completedOrders: completedOrders.length,
      };
    } catch (error: any) {
      console.error('Error fetching branch stats:', error);
      return null;
    }
  },

  // Check vendor open status
  isBranchOpen: async (branchId: string): Promise<boolean> => {
    try {
      const branch = await branchService.getBranchById(branchId);
      if (!branch) {
        return false;
      }

      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const todayHours = branch.openingHours.find((h) => h.day === dayOfWeek);
      if (!todayHours || !todayHours.isOpen) {
        return false;
      }

      return currentTime >= todayHours.open && currentTime <= todayHours.close;
    } catch (error: any) {
      console.error('Error checking branch open status:', error);
      return false;
    }
  },
};
