import { supabase } from './supabaseClient';
import { Product, VerticalType, SearchFilters } from '@types/index';

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  total: number;
  page: number;
  limit: number;
}

export const productService = {
  // Get all products with filters
  getProducts: async (filters?: SearchFilters, page = 1, limit = 20): Promise<ProductsResponse> => {
    try {
      let query = supabase
        .from('products')
        .select('*, branch:branches(*)', { count: 'exact' });

      // Apply filters
      if (filters?.vertical) {
        query = query.eq('vertical', filters.vertical);
      }
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.rating) {
        query = query.gte('rating', filters.rating);
      }
      if (filters?.inStock) {
        query = query.gt('stock', 0);
      }

      // Apply sorting
      const sortBy = filters?.sortBy || 'createdAt';
      const sortOrder = filters?.sortOrder === 'asc' ? { ascending: true } : { ascending: false };
      query = query.order(sortBy, sortOrder);

      // Apply pagination
      const from = (page - 1) * limit;
      query = query.range(from, from + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Product[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*, branch:branches(*)')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data as Product;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  // Get products by vertical
  getProductsByVertical: async (vertical: VerticalType, page = 1, limit = 20): Promise<ProductsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('products')
        .select('*, branch:branches(*)', { count: 'exact' })
        .eq('vertical', vertical)
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Product[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching products by vertical:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Get featured products
  getFeaturedProducts: async (vertical?: VerticalType): Promise<Product[]> => {
    try {
      let query = supabase
        .from('products')
        .select('*, branch:branches(*)')
        .eq('isFeatured', true)
        .eq('isAvailable', true);

      if (vertical) {
        query = query.eq('vertical', vertical);
      }

      const { data, error } = await query.limit(20);

      if (error) {
        throw error;
      }

      return data as Product[];
    } catch (error: any) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string, page = 1, limit = 20): Promise<ProductsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('products')
        .select('*, branch:branches(*)', { count: 'exact' })
        .eq('category', categoryId)
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Product[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching products by category:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Get products by vendor
  getProductsByBranch: async (branchId: string, page = 1, limit = 20): Promise<ProductsResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('products')
        .select('*, branch:branches(*)', { count: 'exact' })
        .eq('branch_id', branchId)
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Product[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching products by vendor:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Search products
  searchProducts: async (query: string, filters?: SearchFilters): Promise<Product[]> => {
    try {
      let searchQuery = supabase
        .from('products')
        .select('*, branch:branches(*)')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      if (filters?.vertical) {
        searchQuery = searchQuery.eq('vertical', filters.vertical);
      }
      if (filters?.minPrice) {
        searchQuery = searchQuery.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        searchQuery = searchQuery.lte('price', filters.maxPrice);
      }

      const { data, error } = await searchQuery.limit(50);

      if (error) {
        throw error;
      }

      return data as Product[];
    } catch (error: any) {
      console.error('Error searching products:', error);
      return [];
    }
  },

  // Get related products
  getRelatedProducts: async (productId: string, limit = 6): Promise<Product[]> => {
    try {
      // Get the product first to get its category
      const product = await productService.getProductById(productId);
      if (!product) {
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('*, branch:branches(*)')
        .eq('category', product.category)
        .neq('id', productId)
        .limit(limit);

      if (error) {
        throw error;
      }

      return data as Product[];
    } catch (error: any) {
      console.error('Error fetching related products:', error);
      return [];
    }
  },

  // Get popular products
  getPopularProducts: async (vertical?: VerticalType, limit = 10): Promise<Product[]> => {
    try {
      let query = supabase
        .from('products')
        .select('*, branch:branches(*)')
        .eq('isAvailable', true)
        .order('rating', { ascending: false });

      if (vertical) {
        query = query.eq('vertical', vertical);
      }

      const { data, error } = await query.limit(limit);

      if (error) {
        throw error;
      }

      return data as Product[];
    } catch (error: any) {
      console.error('Error fetching popular products:', error);
      return [];
    }
  },

  // Add product to favorites
  addToFavorites: async (productId: string): Promise<void> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data: userFavorites } = await supabase
        .from('users')
        .select('favorites')
        .eq('id', sessionData.session.user.id)
        .single();

      const favorites = userFavorites?.favorites || [];
      if (!favorites.includes(productId)) {
        favorites.push(productId);
      }

      await supabase
        .from('users')
        .update({ favorites })
        .eq('id', sessionData.session.user.id);
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  // Remove product from favorites
  removeFromFavorites: async (productId: string): Promise<void> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data: userFavorites } = await supabase
        .from('users')
        .select('favorites')
        .eq('id', sessionData.session.user.id)
        .single();

      const favorites = (userFavorites?.favorites || []).filter(
        (id: string) => id !== productId
      );

      await supabase
        .from('users')
        .update({ favorites })
        .eq('id', sessionData.session.user.id);
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  // Get user favorites
  getFavorites: async (): Promise<Product[]> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        return [];
      }

      const { data: userFavorites } = await supabase
        .from('users')
        .select('favorites')
        .eq('id', sessionData.session.user.id)
        .single();

      if (!userFavorites?.favorites || userFavorites.favorites.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('products')
        .select('*, branch:branches(*)')
        .in('id', userFavorites.favorites);

      if (error) {
        throw error;
      }

      return data as Product[];
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      return [];
    }
  },

  // Create product (admin/vendor only)
  createProduct: async (productData: Partial<Product>): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select('*, branch:branches(*)')
        .single();

      if (error) {
        throw error;
      }

      return data as Product;
    } catch (error: any) {
      console.error('Error creating product:', error);
      return null;
    }
  },

  // Update product (admin/vendor only)
  updateProduct: async (id: string, productData: Partial<Product>): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select('*, branch:branches(*)')
        .single();

      if (error) {
        throw error;
      }

      return data as Product;
    } catch (error: any) {
      console.error('Error updating product:', error);
      return null;
    }
  },

  // Delete product (admin/vendor only)
  deleteProduct: async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      return false;
    }
  },
};
