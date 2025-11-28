import { api } from './api';
import { Order, CartItem, Address, PaymentMethod } from '@types/index';

export interface CreateOrderData {
  items: CartItem[];
  deliveryAddress: Address;
  paymentMethod: PaymentMethod;
  specialInstructions?: string;
  couponCode?: string;
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  total: number;
  page: number;
  limit: number;
}

export const orderService = {
  // Create new order
  createOrder: async (orderData: CreateOrderData): Promise<Order> => {
    const response = await api.post<{ data: Order }>('/orders', orderData);
    return response.data.data;
  },

  // Get user orders
  getUserOrders: async (page = 1, limit = 10): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>('/orders/my-orders', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get single order
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get<{ data: Order }>(`/orders/${orderId}`);
    return response.data.data;
  },

  // Track order
  trackOrder: async (orderNumber: string): Promise<Order> => {
    const response = await api.get<{ data: Order }>(`/orders/track/${orderNumber}`);
    return response.data.data;
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string): Promise<Order> => {
    const response = await api.post<{ data: Order }>(`/orders/${orderId}/cancel`, { reason });
    return response.data.data;
  },

  // Reorder (create new order from existing)
  reorder: async (orderId: string): Promise<Order> => {
    const response = await api.post<{ data: Order }>(`/orders/${orderId}/reorder`);
    return response.data.data;
  },

  // Rate order
  rateOrder: async (orderId: string, rating: number, comment: string, images?: string[]): Promise<void> => {
    await api.post(`/orders/${orderId}/rate`, { rating, comment, images });
  },

  // Get order invoice
  getOrderInvoice: async (orderId: string): Promise<Blob> => {
    const response = await api.get(`/orders/${orderId}/invoice`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
