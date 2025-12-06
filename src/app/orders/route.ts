import { createAuthenticatedClient, errorResponse, successResponse } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

// تعريف نوع البيانات المتوقع للطلب
interface Order {
  user_id: string; // يجب أن يكون متطابقًا مع user_id في Supabase Auth
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  address_id: number;
  // يمكن إضافة المزيد من الحقول حسب الحاجة
}

/**
 * GET /api/orders
 * جلب قائمة طلبات المستخدم الحالي.
 * يحترم سياسات RLS (المستخدم يرى طلباته فقط).
 */
export async function GET(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    let query = client.from('orders').select('*, order_items(*, products(*))'); // جلب العناصر والمنتجات المرتبطة

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
 * POST /api/orders
 * إنشاء طلب جديد.
 * يجب أن يتم تمرير user_id في الـ body أو تركه لـ RLS لتعيينه تلقائيًا.
 */
export async function POST(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const body: Partial<Order> = await req.json();

    // ملاحظة: RLS يجب أن يضمن أن user_id يتم تعيينه للمستخدم الموثق.
    // إذا كان user_id مطلوبًا في الـ body، يجب التأكد من مطابقته لـ user_id الموثق.
    // هنا، نعتمد على RLS لضمان الأمان.

    const { data, error } = await client
      .from('orders')
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
 * PUT /api/orders
 * تعديل طلب موجود (عادةً تحديث الحالة).
 * يتطلب تمرير ID الطلب في الاستعلام.
 */
export async function PUT(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Order ID is required for update', 400);
    }

    const body: Partial<Order> = await req.json();

    const { data, error } = await client
      .from('orders')
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
 * DELETE /api/orders
 * حذف/إلغاء طلب موجود.
 * يتطلب تمرير ID الطلب في الاستعلام.
 */
export async function DELETE(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Order ID is required for deletion', 400);
    }

    const { error } = await client
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse({ message: 'Order deleted successfully' }, 204);
  } catch (error) {
    return errorResponse(error, 401);
  }
}
