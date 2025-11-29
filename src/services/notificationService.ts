import { supabase } from './supabaseClient';
import { Notification } from '@types/index';

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  total: number;
  unreadCount: number;
}

export const notificationService = {
  // Get user notifications
  getNotifications: async (page = 1, limit = 20): Promise<NotificationsResponse> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        return {
          success: false,
          data: [],
          total: 0,
          unreadCount: 0,
        };
      }

      const from = (page - 1) * limit;
      const { data, error, count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('userId', sessionData.session.user.id)
        .order('createdAt', { ascending: false })
        .range(from, from + limit - 1);

      if (error) {
        throw error;
      }

      const unreadCount = (data as Notification[]).filter((n) => !n.isRead).length;

      return {
        success: true,
        data: data as Notification[],
        total: count || 0,
        unreadCount,
      };
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        data: [],
        total: 0,
        unreadCount: 0,
      };
    }
  },

  // Get unread notifications count
  getUnreadCount: async (): Promise<number> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        return 0;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('userId', sessionData.session.user.id)
        .eq('isRead', false);

      if (error) {
        throw error;
      }

      return data?.length || 0;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Get notification by ID
  getNotificationById: async (notificationId: string): Promise<Notification | null> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('id', notificationId)
        .single();

      if (error) {
        throw error;
      }

      return data as Notification;
    } catch (error: any) {
      console.error('Error fetching notification:', error);
      return null;
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<Notification | null> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ isRead: true })
        .eq('id', notificationId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Notification;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return null;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notifications')
        .update({ isRead: true })
        .eq('userId', sessionData.session.user.id)
        .eq('isRead', false);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', notificationId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },

  // Delete all notifications
  deleteAllNotifications: async (): Promise<boolean> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('userId', sessionData.session.user.id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting all notifications:', error);
      return false;
    }
  },

  // Create notification (admin/system only)
  createNotification: async (notificationData: Partial<Notification>): Promise<Notification | null> => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Notification;
    } catch (error: any) {
      console.error('Error creating notification:', error);
      return null;
    }
  },

  // Send bulk notifications (admin only)
  sendBulkNotifications: async (userIds: string[], notificationData: Partial<Notification>): Promise<boolean> => {
    try {
      const notifications = userIds.map((userId) => ({
        userId,
        ...notificationData,
      }));

      const { error } = await supabase.from('notifications').insert(notifications);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error sending bulk notifications:', error);
      return false;
    }
  },

  // Subscribe to notifications (real-time)
  subscribeToNotifications: (userId: string, callback: (notification: Notification) => void) => {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return subscription;
  },

  // Unsubscribe from notifications
  unsubscribeFromNotifications: async (subscription: any) => {
    await supabase.removeChannel(subscription);
  },
};
