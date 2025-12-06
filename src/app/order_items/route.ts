import { createAuthenticatedClient, errorResponse, successResponse } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

// تعريف نوع البيانات المتوقع لعنصر الطلب
interface OrderItem {
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
}

/**
 * GET /api/order_items
 * جلب عناصر طلب معين.
 * يتطلب تمرير order_id في الاستعلام.
 * يحترم سياسات RLS (المستخدم يرى عناصر طلباته فقط).
 */
export async function GET(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const orderId = searchParams.get('order_id');
    const id = searchParams.get('id');

    if (!orderId && !id) {
      return errorResponse('Order ID or Item ID is required for fetching order items', 400);
    }

    let query = client.from('order_items').select('*, products(name, price)');

    if (id) {
      query = query.eq('id', id).single();
    } else if (orderId) {
      query = query.eq('order_id', orderId);
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
 * POST /api/order_items
 * إضافة عنصر جديد إلى طلب موجود.
 */
export async function POST(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const body: OrderItem = await req.json();

    const { data, error } = await client
      .from('order_items')
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
 * PUT /api/order_items
 * تعديل عنصر طلب موجود (عادةً تعديل الكمية).
 * يتطلب تمرير ID العنصر في الاستعلام.
 */
export async function PUT(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Order Item ID is required for update', 400);
    }

    const body: Partial<OrderItem> = await req.json();

    const { data, error } = await client
      .from('order_items')
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
 * DELETE /api/order_items
 * حذف عنصر طلب موجود.
 * يتطلب تمرير ID العنصر في الاستعلام.
 */
export async function DELETE(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Order Item ID is required for deletion', 400);
    }

    const { error } = await client
      .from('order_items')
      .delete()
      .eq('id', id);

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse({ message: 'Order item deleted successfully' }, 204);
  } catch (error) {
    return errorResponse(error, 401);
  }
}
