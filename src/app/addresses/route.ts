import { createAuthenticatedClient, errorResponse, successResponse } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

// تعريف نوع البيانات المتوقع للعنوان
interface Address {
  user_id: string; // يجب أن يكون متطابقًا مع user_id في Supabase Auth
  city: string;
  street: string;
  building: string;
  is_default: boolean;
  // يمكن إضافة المزيد من الحقول حسب الحاجة
}

/**
 * GET /api/addresses
 * جلب قائمة عناوين المستخدم الحالي.
 * يحترم سياسات RLS (المستخدم يرى عناوينه فقط).
 */
export async function GET(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    let query = client.from('addresses').select('*');

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
 * POST /api/addresses
 * إضافة عنوان جديد للمستخدم الحالي.
 */
export async function POST(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const body: Partial<Address> = await req.json();

    // نعتمد على RLS لضمان أن user_id يتم تعيينه للمستخدم الموثق.

    const { data, error } = await client
      .from('addresses')
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
 * PUT /api/addresses
 * تعديل عنوان موجود.
 * يتطلب تمرير ID العنوان في الاستعلام.
 */
export async function PUT(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Address ID is required for update', 400);
    }

    const body: Partial<Address> = await req.json();

    const { data, error } = await client
      .from('addresses')
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
 * DELETE /api/addresses
 * حذف عنوان موجود.
 * يتطلب تمرير ID العنوان في الاستعلام.
 */
export async function DELETE(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Address ID is required for deletion', 400);
    }

    const { error } = await client
      .from('addresses')
      .delete()
      .eq('id', id);

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse({ message: 'Address deleted successfully' }, 204);
  } catch (error) {
    return errorResponse(error, 401);
  }
}
