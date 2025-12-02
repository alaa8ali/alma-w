import { supabase } from './supabaseClient';
import { User } from '@types/index';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export const authService = {
  // Login with email and password
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        return {
          success: false,
          message: error.message,
        };
      }

      if (!data.user) {
        return {
          success: false,
          message: 'Failed to login',
        };
      }

      // Fetch user profile from users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        // Create user profile if it doesn't exist
        const { data: newProfile } = await supabase
          .from('users')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name || '',
              phone: data.user.user_metadata?.phone || '',
              role: 'customer',
              addresses: [],
              favorites: [],
              loyaltyPoints: 0,
            },
          ])
          .select()
          .single();

        return {
          success: true,
          token: data.session?.access_token,
          user: newProfile as any as User,
        };
      }

      return {
        success: true,
        token: data.session?.access_token,
        user: userProfile as any as User,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'An error occurred during login',
      };
    }
  },

  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          message: authError.message,
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'Failed to create user',
        };
      }

      // Create user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email: data.email,
            name: data.name,
            phone: data.phone,
            role: 'customer',
            addresses: [],
            favorites: [],
            loyaltyPoints: 0,
          },
        ])
        .select()
        .single();

      if (profileError) {
        return {
          success: false,
          message: profileError.message,
        };
      }

      return {
        success: true,
        token: authData.session?.access_token,
        user: userProfile as any as User,
        message: 'Registration successful. Please verify your email.',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'An error occurred during registration',
      };
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        return null;
      }

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sessionData.session.user.id)
        .single();

      if (error) {
        return null;
      }

      return userProfile as any as User;
    } catch (error) {
      return null;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
  },

  // Request password reset
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return {
        message: 'Password reset email sent. Please check your inbox.',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send reset email');
    }
  },

  // Reset password with token
  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        throw error;
      }

      return {
        message: 'Password reset successfully',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to reset password');
    }
  },

  // Verify phone number (placeholder - implement based on your SMS provider)
  verifyPhone: async (phone: string, code: string): Promise<{ success: boolean }> => {
    try {
      // This is a placeholder implementation
      // In production, you would verify the code with your SMS provider
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session?.user) {
        throw new Error('User not authenticated');
      }

      // Update user profile with verified phone
      const { error } = await supabase
        .from('users')
        .update({ phone })
        .eq('id', sessionData.session.user.id);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify phone');
    }
  },

  // Request phone verification code (placeholder)
  requestPhoneVerification: async (phone: string): Promise<{ message: string }> => {
    try {
      // This is a placeholder implementation
      // In production, you would send an SMS code using your SMS provider
      return {
        message: 'Verification code sent to your phone',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send verification code');
    }
  },

  // Get user session
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  // Subscribe to auth changes
  onAuthStateChange: (callback: (user: User | null) => void) => {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await authService.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  },
};
