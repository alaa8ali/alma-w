import { supabase } from './supabaseClient';
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
  createOrder: async (orderData: CreateOrderData): Promise<Order | null> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const shippingFee = 10; // Default shipping fee - adjust as needed
      const tax = subtotal * 0.1; // 10% tax - adjust as needed
      const discount = 0; // Will be calculated based on coupon
      const total = subtotal + shippingFee + tax - discount;

      // Get vendor ID from first item
      const vendorId = orderData.items[0]?.vendorId;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            orderNumber,
            userId: sessionData.session.user.id,
            branchId: vendorId,
            items: orderData.items,
            deliveryAddress: orderData.deliveryAddress,
            status: 'pending',
            paymentMethod: orderData.paymentMethod,
            paymentStatus: 'pending',
            subtotal,
            shippingFee,
            tax,
            discount,
            total,
            couponCode: orderData.couponCode,
            specialInstructions: orderData.specialInstructions,
            estimatedDeliveryTime: new Date(Date.now() + 30 * 60000).toISOString(), // 30 minutes from now
            trackingUpdates: [
              {
                status: 'pending',
                timestamp: new Date().toISOString(),
                message: 'Order placed successfully',
              },
            ],
          },
        ])
        .select('*, branch:branches(*)')
        .single();

      if (orderError) {
        throw orderError;
      }

      // Create order items
      for (const item of orderData.items) {
        await supabase.from('order_items').insert([
          {
            orderId: order.id,
            productId: item._id,
            quantity: item.quantity,
            price: item.price,
            selectedVariant: item.selectedVariant,
            specialInstructions: item.specialInstructions,
            addons: item.addons,
          },
        ]);
      }

      return order as Order;
    } catch (error: any) {
      console.error('Error creating order:', error);
      return null;
    }
  },

  // Get user orders
  getUserOrders: async (page = 1, limit = 10): Promise<OrdersResponse> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        return {
          success: false,
          data: [],
          total: 0,
          page,
          limit,
        };
      }

      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('orders')
        .select('*, branch:branches(*)', { count: 'exact' })
        .eq('userId', sessionData.session.user.id)
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Order[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching user orders:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },

  // Get single order
  getOrderById: async (orderId: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, branch:branches(*)')
        .eq('id', orderId)
        .single();

      if (error) {
        throw error;
      }

      return data as Order;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      return null;
    }
  },

  // Track order
  trackOrder: async (orderNumber: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, branch:branches(*)')
        .eq('orderNumber', orderNumber)
        .single();

      if (error) {
        throw error;
      }

      return data as Order;
    } catch (error: any) {
      console.error('Error tracking order:', error);
      return null;
    }
  },

  // Cancel order
  cancelOrder: async (orderId: string, reason?: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({
          status: 'cancelled',
          paymentStatus: 'refunded',
        })
        .eq('id', orderId)
        .select('*, branch:branches(*)')
        .single();

      if (error) {
        throw error;
      }

      return data as Order;
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      return null;
    }
  },

  // Reorder (create new order from existing)
  reorder: async (orderId: string): Promise<Order | null> => {
    try {
      // Get original order
      const originalOrder = await orderService.getOrderById(orderId);
      if (!originalOrder) {
        throw new Error('Original order not found');
      }

      // Create new order with same items
      const newOrderData: CreateOrderData = {
        items: originalOrder.items,
        deliveryAddress: originalOrder.deliveryAddress,
        paymentMethod: originalOrder.paymentMethod,
        specialInstructions: originalOrder.specialInstructions,
      };

      return await orderService.createOrder(newOrderData);
    } catch (error: any) {
      console.error('Error reordering:', error);
      return null;
    }
  },

  // Rate order
  rateOrder: async (orderId: string, rating: number, comment: string, images?: string[]): Promise<void> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      // Get order to get product IDs
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Create review for each product in the order
      for (const item of order.items) {
        await supabase.from('reviews').insert([
          {
            userId: sessionData.session.user.id,
            productId: item._id,
            orderId,
            rating,
            comment,
            images,
            helpful: 0,
          },
        ]);
      }

      // Update order status
      await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', orderId);
    } catch (error: any) {
      console.error('Error rating order:', error);
      throw error;
    }
  },

  // Get order invoice
  getOrderInvoice: async (orderId: string): Promise<Blob> => {
    try {
      const order = await orderService.getOrderById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      // Generate invoice as PDF (placeholder - implement with a PDF library)
      const invoiceContent = `
        Invoice
        Order Number: ${order.orderNumber}
        Date: ${new Date(order.createdAt).toLocaleDateString()}
        
        Items:
        ${order.items.map((item) => `${item.name} x${item.quantity} - ${item.price * item.quantity}`).join('\n')}
        
        Subtotal: ${order.subtotal}
        Shipping Fee: ${order.shippingFee}
        Tax: ${order.tax}
        Total: ${order.total}
      `;

      return new Blob([invoiceContent], { type: 'text/plain' });
    } catch (error: any) {
      console.error('Error generating invoice:', error);
      throw error;
    }
  },

  // Update order status (admin/vendor only)
  updateOrderStatus: async (orderId: string, status: string): Promise<Order | null> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .select('*, branch:branches(*)')
        .single();

      if (error) {
        throw error;
      }

      return data as Order;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      return null;
    }
  },

  // Get all orders (admin only)
  getAllOrders: async (page = 1, limit = 20): Promise<OrdersResponse> => {
    try {
      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('orders')
        .select('*, branch:branches(*)', { count: 'exact' })
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      return {
        success: true,
        data: data as Order[],
        total: count || 0,
        page,
        limit,
      };
    } catch (error: any) {
      console.error('Error fetching all orders:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
      };
    }
  },
};
