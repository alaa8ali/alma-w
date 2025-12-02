# Supabase Setup Guide for ALMA World

هذا الدليل يشرح كيفية إعداد قاعدة بيانات Supabase وتنفيذ جميع الدوال والجداول المطلوبة لمشروع ALMA World.

## 1. إنشاء الجداول الأساسية

قم بتنفيذ الأوامر التالية في Supabase SQL Editor لإنشاء الجداول الأساسية:

### جدول المستخدمين (users)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  avatar VARCHAR,
  role VARCHAR DEFAULT 'customer' CHECK (role IN ('customer', 'vendor', 'admin', 'delivery')),
  addresses JSONB DEFAULT '[]'::JSONB,
  favorites TEXT[] DEFAULT ARRAY[]::TEXT[],
  loyalty_points INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### جدول المنتجات (products)

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  name_en VARCHAR,
  description TEXT,
  description_en TEXT,
  price DECIMAL NOT NULL,
  original_price DECIMAL,
  discount INTEGER,
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  thumbnail VARCHAR,
  category UUID NOT NULL REFERENCES categories(id),
  subcategory VARCHAR,
  vertical VARCHAR NOT NULL CHECK (vertical IN ('store', 'restaurant', 'sweets', 'services', 'wholesale')),
  branch_id UUID NOT NULL REFERENCES branches(id),
  stock INTEGER DEFAULT 0,
  unit VARCHAR,
  weight VARCHAR,
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  variants JSONB,
  nutrition_info JSONB,
  ingredients TEXT[],
  allergens TEXT[],
  is_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  delivery_time VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_branch ON products(branch_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_vertical ON products(vertical);
CREATE INDEX idx_products_featured ON products(is_featured);
```

### جدول الفئات (categories)

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  name_en VARCHAR,
  icon VARCHAR,
  image VARCHAR,
  vertical VARCHAR NOT NULL CHECK (vertical IN ('store', 'restaurant', 'sweets', 'services', 'wholesale')),
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_categories_vertical ON categories(vertical);
```

### جدول الفئات الفرعية (subcategories)

```sql
CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  name_en VARCHAR,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subcategories_category ON subcategories(category_id);
```

### جدول الفروع (branches)

```sql
CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  name_en VARCHAR,
  logo VARCHAR,
  banner VARCHAR,
  description TEXT,
  vertical VARCHAR NOT NULL CHECK (vertical IN ('store', 'restaurant', 'sweets', 'services', 'wholesale')),
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  delivery_time VARCHAR,
  min_order INTEGER DEFAULT 0,
  delivery_fee DECIMAL DEFAULT 10,
  address JSONB,
  phone VARCHAR,
  email VARCHAR,
  is_open BOOLEAN DEFAULT true,
  opening_hours JSONB DEFAULT '[]'::JSONB,
  categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  featured BOOLEAN DEFAULT false,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendors_vertical ON vendors(vertical);
CREATE INDEX idx_vendors_featured ON vendors(featured);
```

### جدول الطلبات (orders)

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id),
  branch_id UUID NOT NULL REFERENCES branches(id),
  items JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled', 'refunded')),
  payment_method VARCHAR CHECK (payment_method IN ('cash', 'card', 'wallet', 'online')),
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  subtotal DECIMAL NOT NULL,
  delivery_fee DECIMAL DEFAULT 10,
  tax DECIMAL DEFAULT 0,
  discount DECIMAL DEFAULT 0,
  total DECIMAL NOT NULL,
  coupon_code VARCHAR,
  special_instructions TEXT,
  estimated_delivery_time TIMESTAMP,
  actual_delivery_time TIMESTAMP,
  tracking_updates JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_branch ON orders(branch_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
```

### جدول عناصر الطلب (order_items)

```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL NOT NULL,
  selected_variant JSONB,
  special_instructions TEXT,
  addons JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### جدول السائقين (drivers)

```sql
CREATE TABLE drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE,
  phone VARCHAR NOT NULL,
  avatar VARCHAR,
  vehicle_type VARCHAR,
  vehicle_number VARCHAR,
  license_plate VARCHAR,
  rating DECIMAL DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT false,
  current_location JSONB,
  total_trips INTEGER DEFAULT 0,
  total_earnings DECIMAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_drivers_available ON drivers(is_available);
CREATE INDEX idx_drivers_rating ON drivers(rating);
```

### جدول الرحلات (trips)

```sql
CREATE TABLE trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  driver_id UUID REFERENCES drivers(id),
  pickup_location JSONB NOT NULL,
  dropoff_location JSONB NOT NULL,
  status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  fare DECIMAL NOT NULL,
  distance DECIMAL,
  estimated_duration INTEGER,
  actual_duration INTEGER,
  payment_method VARCHAR CHECK (payment_method IN ('cash', 'card', 'wallet')),
  payment_status VARCHAR DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  rating DECIMAL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_trips_user ON trips(user_id);
CREATE INDEX idx_trips_driver ON trips(driver_id);
CREATE INDEX idx_trips_status ON trips(status);
```

### جدول التقييمات (reviews)

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  product_id UUID REFERENCES products(id),
  branch_id UUID REFERENCES branches(id),
  order_id UUID REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images TEXT[],
  helpful INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_branch ON reviews(branch_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
```

### جدول الكوبونات (coupons)

```sql
CREATE TABLE coupons (
  code VARCHAR PRIMARY KEY,
  discount_type VARCHAR NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL NOT NULL,
  min_order_amount DECIMAL DEFAULT 0,
  max_discount DECIMAL,
  usage_limit INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_valid ON coupons(valid_until);
```

### جدول العروض الترويجية (promotions)

```sql
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  image VARCHAR,
  discount_type VARCHAR NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL NOT NULL,
  min_order_amount DECIMAL DEFAULT 0,
  max_discount DECIMAL,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  vertical VARCHAR CHECK (vertical IN ('store', 'restaurant', 'sweets', 'services', 'wholesale')),
  branch_id UUID REFERENCES branches(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promotions_active ON promotions(is_active);
CREATE INDEX idx_promotions_vertical ON promotions(vertical);
```

### جدول الإشعارات (notifications)

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR NOT NULL CHECK (type IN ('order', 'promo', 'system', 'delivery')),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

## 2. تنفيذ SQL Functions

انسخ محتوى ملف `supabase_functions.sql` والصقه في Supabase SQL Editor وقم بتنفيذه. هذا سينشئ جميع الدوال والـ Triggers المطلوبة.

## 3. تفعيل Row Level Security (RLS)

تم تضمين سياسات RLS في ملف `supabase_functions.sql`. تأكد من تفعيلها لضمان أمان البيانات.

## 4. متغيرات البيئة

تأكد من تعيين متغيرات البيئة التالية في ملف `.env.local`:

```
VITE_SUPABASE_URL=https://yqnvdurconsjesnampmj.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 5. استخدام الدوال من الواجهة الأمامية

يمكنك استدعاء الدوال من الواجهة الأمامية باستخدام `supabase.rpc()`:

```typescript
// مثال: حساب إجمالي الطلب
const { data, error } = await supabase.rpc('calculate_order_total', {
  subtotal: 100,
  delivery_fee: 10,
  tax_rate: 0.1,
  discount: 5
});

// مثال: تطبيق كوبون
const { data, error } = await supabase.rpc('apply_coupon_to_order', {
  coupon_code: 'SAVE10',
  order_subtotal: 100
});

// مثال: إيجاد أقرب سائقين
const { data, error } = await supabase.rpc('find_nearest_drivers', {
  pickup_lat: 24.7136,
  pickup_lng: 46.6753,
  radius_km: 5,
  limit_count: 5
});
```

## 6. نصائح الأمان

1. **استخدم Row Level Security (RLS):** تأكد من تفعيل RLS على جميع الجداول الحساسة.
2. **استخدم Anon Key في الواجهة الأمامية:** لا تستخدم Service Role Key في الواجهة الأمامية.
3. **تحقق من الصلاحيات:** تأكد من أن المستخدمين يمكنهم فقط الوصول إلى بياناتهم الخاصة.
4. **استخدم HTTPS:** تأكد من استخدام HTTPS في جميع الاتصالات.

## 7. الخطوات التالية

بعد إعداد Supabase:

1. قم بتشغيل الواجهة الأمامية باستخدام `npm run dev`
2. اختبر جميع الخدمات والدوال
3. قم بنشر المشروع على Vercel

## 8. الدعم والمساعدة

إذا واجهت أي مشاكل:

1. تحقق من سجلات Supabase في لوحة التحكم
2. تأكد من أن جميع الجداول والدوال تم إنشاؤها بنجاح
3. تحقق من متغيرات البيئة
4. تحقق من سياسات RLS

---

**ملاحظة:** هذا الدليل يفترض أنك لديك حساب Supabase نشط وأنك قمت بإنشاء مشروع جديد.
