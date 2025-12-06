import { createAuthenticatedClient, errorResponse, successResponse } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

// تعريف نوع البيانات المتوقع للمنتج
interface Product {
  name: string;
  description: string;
  price: number;
  category_id: number;
  // يمكن إضافة المزيد من الحقول حسب الحاجة
}

/**
 * GET /api/products
 * جلب قائمة المنتجات (أو منتج واحد إذا تم تمرير ID في الاستعلام)
 * يحترم سياسات RLS للمستخدم الموثق.
 */
export async function GET(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    let query = client.from('products').select('*');

    if (id) {
      query = query.eq('id', id).single();
    }

    const { data, error } = await query;

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse(data);
  } catch (error) {
    return errorResponse(error, 401); // 401 Unauthorized إذا فشل إنشاء العميل (مثل عدم وجود توكن)
  }
}

/**
 * POST /api/products
 * إضافة منتج جديد.
 * يتطلب صلاحيات إدارية عبر RLS.
 */
export async function POST(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const body: Product = await req.json();

    const { data, error } = await client
      .from('products')
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
 * PUT /api/products
 * تعديل منتج موجود.
 * يتطلب تمرير ID المنتج في الاستعلام.
 * يتطلب صلاحيات إدارية عبر RLS.
 */
export async function PUT(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Product ID is required for update', 400);
    }

    const body: Partial<Product> = await req.json();

    const { data, error } = await client
      .from('products')
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
 * DELETE /api/products
 * حذف منتج موجود.
 * يتطلب تمرير ID المنتج في الاستعلام.
 * يتطلب صلاحيات إدارية عبر RLS.
 */
export async function DELETE(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Product ID is required for deletion', 400);
    }

    const { error } = await client
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse({ message: 'Product deleted successfully' }, 204);
  } catch (error) {
    return errorResponse(error, 401);
  }
}
