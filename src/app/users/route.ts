import { createAuthenticatedClient, errorResponse, successResponse } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

// تعريف نوع البيانات المتوقع للمستخدم (لبيانات الملف الشخصي)
interface UserProfile {
  full_name?: string;
  phone_number?: string;
  // يمكن إضافة المزيد من حقول الملف الشخصي هنا
}

/**
 * GET /api/users
 * جلب بيانات الملف الشخصي للمستخدم الحالي.
 * يحترم سياسات RLS (المستخدم يرى ملفه الشخصي فقط).
 */
export async function GET(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);

    // جلب بيانات المستخدم الموثق
    const { data: { user }, error: userError } = await client.auth.getUser();

    if (userError || !user) {
      return errorResponse('User not authenticated', 401);
    }

    // جلب بيانات الملف الشخصي من جدول 'users'
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', user.id) // يفترض أن جدول users يحتوي على عمود id مطابق لـ auth.users.id
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
 * PUT /api/users
 * تعديل بيانات الملف الشخصي للمستخدم الحالي.
 * يحترم سياسات RLS (المستخدم يعدل ملفه الشخصي فقط).
 */
export async function PUT(req: NextRequest) {
  try {
    const client = createAuthenticatedClient(req);
    const body: Partial<UserProfile> = await req.json();

    // جلب بيانات المستخدم الموثق
    const { data: { user }, error: userError } = await client.auth.getUser();

    if (userError || !user) {
      return errorResponse('User not authenticated', 401);
    }

    const { data, error } = await client
      .from('users')
      .update(body)
      .eq('id', user.id)
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

// ملاحظة: تم حذف POST و DELETE لأنها تتعلق عادةً بـ Supabase Auth
// ولكن يمكن إضافتها إذا كان جدول 'users' يستخدم لبيانات إضافية غير الملف الشخصي.

// POST /api/users (لإنشاء ملف شخصي بعد التسجيل)
export async function POST(req: NextRequest) {
  return errorResponse('User creation is handled by Supabase Auth. Use PUT to update profile.', 405);
}

// DELETE /api/users (لحذف الملف الشخصي)
export async function DELETE(req: NextRequest) {
  return errorResponse('User deletion is a sensitive operation. Use PUT to update profile.', 405);
}
