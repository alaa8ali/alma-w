import { supabase } from './supabaseClient';
import { Review } from '@types/index';

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
  total: number;
  page: number;
  limit: number;
}

export const reviewService = {
  // Get reviews for a product
  getProductReviews: async (productId: string, page = 1, limit = 10): Promise<ReviewsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('productId', productId)
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Review[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching product reviews:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Get reviews for a vendor
  getVendorReviews: async (vendorId: string, page = 1, limit = 10): Promise<ReviewsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact' })
        .eq('vendorId', vendorId)
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Review[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching vendor reviews:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Get review by ID
  getReviewById: async (reviewId: string): Promise<Review | null> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (error) {
        throw error;
      }

      return data as Review;
    } catch (error: any) {
      console.error('Error fetching review:', error);
      return null;
    }
  },

  // Create review
  createReview: async (reviewData: Partial<Review>): Promise<Review | null> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            userId: sessionData.session.user.id,
            ...reviewData,
            helpful: 0,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Review;
    } catch (error: any) {
      console.error('Error creating review:', error);
      return null;
    }
  },

  // Update review
  updateReview: async (reviewId: string, reviewData: Partial<Review>): Promise<Review | null> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .update(reviewData)
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Review;
    } catch (error: any) {
      console.error('Error updating review:', error);
      return null;
    }
  },

  // Delete review
  deleteReview: async (reviewId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting review:', error);
      return false;
    }
  },

  // Mark review as helpful
  markAsHelpful: async (reviewId: string): Promise<Review | null> => {
    try {
      const review = await reviewService.getReviewById(reviewId);
      if (!review) {
        throw new Error('Review not found');
      }

      const { data, error } = await supabase
        .from('reviews')
        .update({ helpful: review.helpful + 1 })
        .eq('id', reviewId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Review;
    } catch (error: any) {
      console.error('Error marking review as helpful:', error);
      return null;
    }
  },

  // Get average rating for product
  getProductAverageRating: async (productId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('productId', productId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const average = (data as any[]).reduce((sum, review) => sum + review.rating, 0) / data.length;
      return Math.round(average * 10) / 10; // Round to 1 decimal place
    } catch (error: any) {
      console.error('Error calculating average rating:', error);
      return 0;
    }
  },

  // Get average rating for vendor
  getVendorAverageRating: async (vendorId: string): Promise<number> => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('vendorId', vendorId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      const average = (data as any[]).reduce((sum, review) => sum + review.rating, 0) / data.length;
      return Math.round(average * 10) / 10;
    } catch (error: any) {
      console.error('Error calculating vendor average rating:', error);
      return 0;
    }
  },

  // Get rating distribution for product
  getProductRatingDistribution: async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('productId', productId);

      if (error) {
        throw error;
      }

      const distribution = {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      };

      (data as any[]).forEach((review) => {
        distribution[review.rating as keyof typeof distribution]++;
      });

      return distribution;
    } catch (error: any) {
      console.error('Error fetching rating distribution:', error);
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }
  },
};
