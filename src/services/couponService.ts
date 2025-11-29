import { supabase } from './supabaseClient';
import { Coupon, Promotion } from '@types/index';

export interface CouponsResponse {
  success: boolean;
  data: Coupon[];
  total: number;
}

export interface PromotionsResponse {
  success: boolean;
  data: Promotion[];
  total: number;
}

export const couponService = {
  // Get all coupons
  getCoupons: async (): Promise<Coupon[]> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('isActive', true)
        .gt('validUntil', new Date().toISOString());

      if (error) {
        throw error;
      }

      return data as Coupon[];
    } catch (error: any) {
      console.error('Error fetching coupons:', error);
      return [];
    }
  },

  // Get coupon by code
  getCouponByCode: async (code: string): Promise<Coupon | null> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .eq('isActive', true)
        .gt('validUntil', new Date().toISOString())
        .single();

      if (error) {
        throw error;
      }

      return data as Coupon;
    } catch (error: any) {
      console.error('Error fetching coupon:', error);
      return null;
    }
  },

  // Validate coupon
  validateCoupon: async (code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message: string }> => {
    try {
      const coupon = await couponService.getCouponByCode(code);

      if (!coupon) {
        return {
          valid: false,
          discount: 0,
          message: 'Coupon code is invalid or expired',
        };
      }

      if (coupon.usedCount >= coupon.usageLimit) {
        return {
          valid: false,
          discount: 0,
          message: 'Coupon usage limit exceeded',
        };
      }

      if (orderAmount < coupon.minOrderAmount) {
        return {
          valid: false,
          discount: 0,
          message: `Minimum order amount is ${coupon.minOrderAmount}`,
        };
      }

      let discount = 0;
      if (coupon.discountType === 'percentage') {
        discount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }

      return {
        valid: true,
        discount,
        message: 'Coupon applied successfully',
      };
    } catch (error: any) {
      console.error('Error validating coupon:', error);
      return {
        valid: false,
        discount: 0,
        message: 'Error validating coupon',
      };
    }
  },

  // Create coupon (admin only)
  createCoupon: async (couponData: Partial<Coupon>): Promise<Coupon | null> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .insert([couponData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Coupon;
    } catch (error: any) {
      console.error('Error creating coupon:', error);
      return null;
    }
  },

  // Update coupon (admin only)
  updateCoupon: async (code: string, couponData: Partial<Coupon>): Promise<Coupon | null> => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .update(couponData)
        .eq('code', code)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Coupon;
    } catch (error: any) {
      console.error('Error updating coupon:', error);
      return null;
    }
  },

  // Delete coupon (admin only)
  deleteCoupon: async (code: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('coupons').delete().eq('code', code);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting coupon:', error);
      return false;
    }
  },

  // Use coupon (increment usage count)
  useCoupon: async (code: string): Promise<boolean> => {
    try {
      const coupon = await couponService.getCouponByCode(code);
      if (!coupon) {
        throw new Error('Coupon not found');
      }

      const { error } = await supabase
        .from('coupons')
        .update({ usedCount: coupon.usedCount + 1 })
        .eq('code', code);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error using coupon:', error);
      return false;
    }
  },

  // ============================================
  // PROMOTIONS
  // ============================================

  // Get all promotions
  getPromotions: async (): Promise<Promotion[]> => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('isActive', true)
        .gt('validUntil', new Date().toISOString())
        .order('validUntil', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Promotion[];
    } catch (error: any) {
      console.error('Error fetching promotions:', error);
      return [];
    }
  },

  // Get promotion by ID
  getPromotionById: async (promotionId: string): Promise<Promotion | null> => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', promotionId)
        .single();

      if (error) {
        throw error;
      }

      return data as Promotion;
    } catch (error: any) {
      console.error('Error fetching promotion:', error);
      return null;
    }
  },

  // Get promotions by vertical
  getPromotionsByVertical: async (vertical: string): Promise<Promotion[]> => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('vertical', vertical)
        .eq('isActive', true)
        .gt('validUntil', new Date().toISOString());

      if (error) {
        throw error;
      }

      return data as Promotion[];
    } catch (error: any) {
      console.error('Error fetching promotions by vertical:', error);
      return [];
    }
  },

  // Create promotion (admin only)
  createPromotion: async (promotionData: Partial<Promotion>): Promise<Promotion | null> => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert([promotionData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Promotion;
    } catch (error: any) {
      console.error('Error creating promotion:', error);
      return null;
    }
  },

  // Update promotion (admin only)
  updatePromotion: async (promotionId: string, promotionData: Partial<Promotion>): Promise<Promotion | null> => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .update(promotionData)
        .eq('id', promotionId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Promotion;
    } catch (error: any) {
      console.error('Error updating promotion:', error);
      return null;
    }
  },

  // Delete promotion (admin only)
  deletePromotion: async (promotionId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('promotions').delete().eq('id', promotionId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting promotion:', error);
      return false;
    }
  },
};
