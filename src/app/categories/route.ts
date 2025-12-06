import { createAuthenticatedClient, errorResponse, successResponse } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

// تعريف نوع البيانات المتوقع للفئة
interface Category {
  name: string;
  description?: string;
}

/**
 * GET /api/categories
 * جلب قائمة الفئات.
 * يحترم سياسات RLS للمستخدم الموثق.
 */
export async function GET(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    let query = client.from('categories').select('*');

    if (id) {
      query = query.eq('id', id).single();
    }

    const { data, error } = await query;

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse(data);
  } catch (error) {
    return errorResponse(error, 401);
  }
}

/**
 * POST /api/categories
 * إضافة فئة جديدة.
 * يتطلب صلاحيات إدارية عبر RLS.
 */
export async function POST(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const body: Category = await req.json();

    const { data, error } = await client
      .from('categories')
      .insert(body)
      .select()
      .single();

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse(data, 201);
  } catch (error) {
    return errorResponse(error, 401);
  }
}

/**
 * PUT /api/categories
 * تعديل فئة موجودة.
 * يتطلب تمرير ID الفئة في الاستعلام.
 * يتطلب صلاحيات إدارية عبر RLS.
 */
export async function PUT(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Category ID is required for update', 400);
    }

    const body: Partial<Category> = await req.json();

    const { data, error } = await client
      .from('categories')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse(data);
  } catch (error) {
    return errorResponse(error, 401);
  }
}

/**
 * DELETE /api/categories
 * حذف فئة موجودة.
 * يتطلب تمرير ID الفئة في الاستعلام.
 * يتطلب صلاحيات إدارية عبر RLS.
 */
export async function DELETE(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Category ID is required for deletion', 400);
    }

    const { error } = await client
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse({ message: 'Category deleted successfully' }, 204);
  } catch (error) {
    return errorResponse(error, 401);
  }
}
