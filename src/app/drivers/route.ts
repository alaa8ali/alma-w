import { createAuthenticatedClient, errorResponse, successResponse } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

// تعريف نوع البيانات المتوقع للسائق
interface Driver {
  full_name: string;
  phone_number: string;
  status: 'available' | 'on_delivery' | 'offline';
  // يمكن إضافة المزيد من الحقول حسب الحاجة
}

/**
 * GET /api/drivers
 * جلب قائمة السائقين (أو سائق واحد إذا تم تمرير ID في الاستعلام).
 * يتطلب صلاحيات إدارية أو صلاحيات خاصة بالسائقين عبر RLS.
 */
export async function GET(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    let query = client.from('drivers').select('*');

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
 * POST /api/drivers
 * إضافة سائق جديد.
 * يتطلب صلاحيات إدارية عبر RLS.
 */
export async function POST(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const body: Driver = await req.json();

    const { data, error } = await client
      .from('drivers')
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
 * PUT /api/drivers
 * تعديل بيانات سائق موجود.
 * يتطلب تمرير ID السائق في الاستعلام.
 * يتطلب صلاحيات إدارية أو صلاحيات خاصة بالسائقين عبر RLS.
 */
export async function PUT(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Driver ID is required for update', 400);
    }

    const body: Partial<Driver> = await req.json();

    const { data, error } = await client
      .from('drivers')
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
 * DELETE /api/drivers
 * حذف سائق موجود.
 * يتطلب تمرير ID السائق في الاستعلام.
 * يتطلب صلاحيات إدارية عبر RLS.
 */
export async function DELETE(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Driver ID is required for deletion', 400);
    }

    const { error } = await client
      .from('drivers')
      .delete()
      .eq('id', id);

    if (error) {
      return errorResponse(error, 400);
    }

    return successResponse({ message: 'Driver deleted successfully' }, 204);
  } catch (error) {
    return errorResponse(error, 401);
  }
}
