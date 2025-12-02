import { supabase } from './supabaseClient';
import { Category, VerticalType } from '@types/index';

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
  total: number;
}

export const categoryService = {
  // Get all categories
  getCategories: async (vertical?: VerticalType): Promise<Category[]> => {
    try {
      let query = supabase.from('categories').select('*');

      if (vertical) {
        query = query.eq('vertical', vertical);
      }

      const { data, error } = await query.order('order', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Category[];
    } catch (error: any) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  // Get category by ID
  getCategoryById: async (categoryId: string): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (error) {
        throw error;
      }

      return data as Category;
    } catch (error: any) {
      console.error('Error fetching category:', error);
      return null;
    }
  },

  // Get categories by vertical
  getCategoriesByVertical: async (vertical: VerticalType): Promise<Category[]> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('vertical', vertical)
        .order('order', { ascending: true });

      if (error) {
        throw error;
      }

      return data as Category[];
    } catch (error: any) {
      console.error('Error fetching categories by vertical:', error);
      return [];
    }
  },

  // Create category (admin only)
  createCategory: async (categoryData: Partial<Category>): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([categoryData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Category;
    } catch (error: any) {
      console.error('Error creating category:', error);
      return null;
    }
  },

  // Update category (admin only)
  updateCategory: async (categoryId: string, categoryData: Partial<Category>): Promise<Category | null> => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', categoryId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as Category;
    } catch (error: any) {
      console.error('Error updating category:', error);
      return null;
    }
  },

  // Delete category (admin only)
  deleteCategory: async (categoryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('categories').delete().eq('id', categoryId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting category:', error);
      return false;
    }
  },

  // Get subcategories
  getSubcategories: async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('categoryId', categoryId);

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error fetching subcategories:', error);
      return [];
    }
  },

  // Create subcategory (admin only)
  createSubcategory: async (subcategoryData: any): Promise<any | null> => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .insert([subcategoryData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error creating subcategory:', error);
      return null;
    }
  },

  // Update subcategory (admin only)
  updateSubcategory: async (subcategoryId: string, subcategoryData: any): Promise<any | null> => {
    try {
      const { data, error } = await supabase
        .from('subcategories')
        .update(subcategoryData)
        .eq('id', subcategoryId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('Error updating subcategory:', error);
      return null;
    }
  },

  // Delete subcategory (admin only)
  deleteSubcategory: async (subcategoryId: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from('subcategories').delete().eq('id', subcategoryId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error deleting subcategory:', error);
      return false;
    }
  },
};
