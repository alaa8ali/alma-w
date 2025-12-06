import { createClient } from '@supabase/supabase-js';

// تأكد من أن متغيرات البيئة موجودة
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * تهيئة Supabase Client باستخدام مفتاح دور الخدمة (Service Role Key).
 * هذا العميل يمنح وصولاً كاملاً لقاعدة البيانات ويتجاوز سياسات RLS.
 * يجب استخدامه بحذر شديد وفقط في بيئة الخادم (API Routes).
 *
 * @returns SupabaseClient
 */
export const supabaseServiceRole = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * دالة لإنشاء Supabase Client يعمل بصلاحيات المستخدم الموثق (Authenticated User).
 * يتم استخراج رمز JWT من رأس 'Authorization' في الطلب.
 * هذا العميل سيحترم سياسات RLS.
 *
 * @param req - طلب Next.js (NextRequest أو ما يعادله).
 * @returns SupabaseClient يعمل بصلاحيات المستخدم الموثق.
 */
export const createAuthenticatedClient = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    throw new Error('Authorization token not found');
  }

  // نستخدم مفتاح دور الخدمة لتهيئة العميل، ثم نستخدم setAuth لتعيين جلسة المستخدم.
  // هذا يضمن أن العميل يعمل بصلاحيات المستخدم الموثق ويحترم RLS.
  const client = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // تعيين جلسة المستخدم باستخدام JWT المستخرج
  client.auth.setAuth(token);

  return client;
};

/**
 * دالة مساعدة لإنشاء استجابة JSON موحدة للأخطاء.
 * @param error - كائن الخطأ أو رسالة الخطأ.
 * @param status - رمز حالة HTTP.
 * @returns استجابة JSON.
 */
export const errorResponse = (error: any, status: number = 500) => {
  const message = error instanceof Error ? error.message : String(error);
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

/**
 * دالة مساعدة لإنشاء استجابة JSON موحدة للنجاح.
 * @param data - البيانات المراد إرجاعها.
 * @param status - رمز حالة HTTP.
 * @returns استجابة JSON.
 */
export const successResponse = (data: any, status: number = 200) => {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};
