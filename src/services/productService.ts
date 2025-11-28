import { api } from './api';
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
    const params = {
      ...filters,
      page,
      limit,
    };
    const response = await api.get<ProductsResponse>('/products', { params });
    return response.data;
  },

  // Get single product by ID
  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  // Get products by vertical
  getProductsByVertical: async (vertical: VerticalType, page = 1, limit = 20): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(`/products/vertical/${vertical}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get featured products
  getFeaturedProducts: async (vertical?: VerticalType): Promise<Product[]> => {
    const params = vertical ? { vertical } : {};
    const response = await api.get<{ data: Product[] }>('/products/featured', { params });
    return response.data.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string, page = 1, limit = 20): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(`/products/category/${categoryId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Get products by vendor
  getProductsByVendor: async (vendorId: string, page = 1, limit = 20): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>(`/products/vendor/${vendorId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  // Search products
  searchProducts: async (query: string, filters?: SearchFilters): Promise<Product[]> => {
    const params = {
      q: query,
      ...filters,
    };
    const response = await api.get<{ data: Product[] }>('/products/search', { params });
    return response.data.data;
  },

  // Get related products
  getRelatedProducts: async (productId: string, limit = 6): Promise<Product[]> => {
    const response = await api.get<{ data: Product[] }>(`/products/${productId}/related`, {
      params: { limit },
    });
    return response.data.data;
  },

  // Get popular products
  getPopularProducts: async (vertical?: VerticalType, limit = 10): Promise<Product[]> => {
    const params = { vertical, limit };
    const response = await api.get<{ data: Product[] }>('/products/popular', { params });
    return response.data.data;
  },

  // Add product to favorites
  addToFavorites: async (productId: string): Promise<void> => {
    await api.post(`/products/${productId}/favorite`);
  },

  // Remove product from favorites
  removeFromFavorites: async (productId: string): Promise<void> => {
    await api.delete(`/products/${productId}/favorite`);
  },

  // Get user favorites
  getFavorites: async (): Promise<Product[]> => {
    const response = await api.get<{ data: Product[] }>('/products/favorites');
    return response.data.data;
  },
};
