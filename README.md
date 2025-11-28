# 🌟 ALMA World - منصة سحابية شاملة متعددة الخدمات

<div align="center">

![ALMA World](https://img.shields.io/badge/version-2.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.3-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178c6.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**منصة متكاملة تجمع المتجر، المطعم، الحلويات، الخدمات، والجملة في تطبيق واحد**

[المميزات](#-المميزات) • [التثبيت](#-التثبيت) • [الاستخدام](#-الاستخدام) • [المساهمة](#-المساهمة)

</div>

---

## 📋 جدول المحتويات

- [نظرة عامة](#-نظرة-عامة)
- [المميزات](#-المميزات)
- [التقنيات المستخدمة](#-التقنيات-المستخدمة)
- [هيكل المشروع](#-هيكل-المشروع)
- [التثبيت](#-التثبيت)
- [الإعداد](#-الإعداد)
- [تشغيل المشروع](#-تشغيل-المشروع)
- [البناء والنشر](#-البناء-والنشر)
- [API Documentation](#-api-documentation)
- [المساهمة](#-المساهمة)
- [الترخيص](#-الترخيص)

---

## 🎯 نظرة عامة

**ALMA World** هي منصة سحابية شاملة متعددة الخدمات تجمع خمس خدمات رئيسية في تطبيق واحد:

### 🛒 المتجر (Store)
- منتجات البقالة والمواد الغذائية
- المنتجات المنزلية والعناية الشخصية
- الإلكترونيات والأجهزة

### 🍔 المطعم (Restaurant)
- طلب الطعام من المطاعم المحلية
- قوائم طعام متنوعة
- تتبع الطلب في الوقت الفعلي

### 🍰 الحلويات (Sweets)
- محل حلويات شرقية وغربية
- كيك وحلويات مخصصة
- هدايا ومناسبات

### 🔧 الخدمات (Services)
- خدمات منزلية (سباكة، كهرباء، تنظيف)
- خدمات تقنية
- خدمات توصيل وشحن

### 📦 الجملة (Wholesale)
- منتجات بالجملة بأسعار مخفضة
- للتجار وأصحاب المحلات
- كميات كبيرة

---

## ✨ المميزات

### 🎨 واجهة المستخدم
- ✅ تصميم عصري وأنيق
- ✅ Mobile-First Responsive Design
- ✅ Dark Mode / Light Mode
- ✅ دعم اللغة العربية والإنجليزية (RTL/LTR)
- ✅ Animations سلسة باستخدام Framer Motion
- ✅ PWA - يمكن تثبيته كتطبيق

### 🛡️ المصادقة والأمان
- ✅ تسجيل دخول آمن (JWT)
- ✅ التحقق من رقم الهاتف
- ✅ استرجاع كلمة المرور
- ✅ حماية الـ Routes
- ✅ Role-Based Access Control (Customer/Vendor/Admin)

### 🛒 التسوق
- ✅ سلة تسوق متقدمة
- ✅ المفضلة (Wishlist)
- ✅ البحث الذكي والفلترة
- ✅ تتبع الطلبات في الوقت الفعلي
- ✅ تقييمات ومراجعات
- ✅ نظام الكوبونات والخصومات

### 💳 الدفع والتوصيل
- ✅ طرق دفع متعددة (نقدي، بطاقة، محفظة)
- ✅ تكامل مع بوابات الدفع
- ✅ اختيار العنوان على الخريطة
- ✅ حساب تكلفة التوصيل
- ✅ جدولة التوصيل

### 🤖 الذكاء الاصطناعي
- ✅ Chatbot ذكي باستخدام Google Gemini
- ✅ توصيات منتجات مخصصة
- ✅ دعم فني تلقائي

### 📊 لوحة التحكم (للبائعين والإدارة)
- ✅ إدارة المنتجات
- ✅ معالجة الطلبات
- ✅ إحصائيات وتحليلات
- ✅ إدارة العملاء
- ✅ تقارير المبيعات
- ✅ إدارة المخزون

### 🔔 الإشعارات
- ✅ Push Notifications
- ✅ تنبيهات الطلبات
- ✅ إشعارات العروض

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **React 18.3** - مكتبة UI
- **TypeScript 5.5** - Type Safety
- **Vite 5** - Build Tool سريع
- **React Router 6** - Routing
- **Zustand 4** - State Management
- **TailwindCSS 3** - Styling
- **Framer Motion 11** - Animations
- **Axios** - HTTP Client
- **React Query 3** - Data Fetching
- **Socket.io Client** - Real-time Updates
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Swiper** - Sliders/Carousels
- **Recharts** - Charts & Analytics

### Backend (Node.js)
- **Express.js** - Web Framework
- **MongoDB + Mongoose** - Database
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Multer** - File Upload
- **Socket.io** - WebSockets
- **Nodemailer** - Email Service
- **Stripe/PayPal** - Payment Gateway

### AI & APIs
- **Google Gemini AI** - Chatbot
- **Google Maps API** - Location Services
- **Twilio** - SMS Verification

### DevOps & Tools
- **Docker** - Containerization
- **Nginx** - Reverse Proxy
- **PM2** - Process Manager
- **Git** - Version Control

---

## 📁 هيكل المشروع

```
alma-world-pro/
├── src/
│   ├── components/         # React Components
│   │   ├── common/        # مكونات مشتركة
│   │   ├── layout/        # تخطيطات الصفحة
│   │   ├── auth/          # مكونات المصادقة
│   │   ├── store/         # مكونات المتجر
│   │   ├── restaurant/    # مكونات المطعم
│   │   ├── sweets/        # مكونات الحلويات
│   │   ├── services/      # مكونات الخدمات
│   │   ├── wholesale/     # مكونات الجملة
│   │   ├── admin/         # لوحة التحكم
│   │   └── profile/       # الملف الشخصي
│   ├── pages/             # صفحات التطبيق
│   ├── hooks/             # Custom Hooks
│   ├── store/             # Zustand Stores
│   ├── services/          # API Services
│   ├── utils/             # Utility Functions
│   ├── types/             # TypeScript Types
│   ├── assets/            # الصور والأيقونات
│   ├── styles/            # CSS Files
│   ├── App.tsx            # المكون الرئيسي
│   └── main.tsx           # نقطة البداية
├── server/                # Backend Code
│   ├── controllers/       # Route Controllers
│   ├── models/            # Database Models
│   ├── routes/            # API Routes
│   ├── middleware/        # Middleware
│   ├── config/            # Configuration
│   ├── utils/             # Utilities
│   └── index.js           # Server Entry
├── public/                # Static Files
├── .env.example           # Environment Variables Template
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript Config
├── vite.config.ts         # Vite Config
├── tailwind.config.js     # Tailwind Config
└── README.md              # هذا الملف
```

---

## 🚀 التثبيت

### المتطلبات الأساسية

- Node.js (v18 أو أحدث)
- npm أو yarn
- MongoDB (v6 أو أحدث)
- Git

### 1. استنساخ المشروع

```bash
git clone https://github.com/your-username/alma-world-pro.git
cd alma-world-pro
```

### 2. تثبيت التبعيات

```bash
# تثبيت تبعيات Frontend
npm install

# تثبيت تبعيات Backend (اختياري إذا كنت تريد تشغيل Backend محلياً)
cd server
npm install
cd ..
```

---

## ⚙️ الإعداد

### 1. إعداد متغيرات البيئة

انسخ ملف `.env.example` إلى `.env.local`:

```bash
cp .env.example .env.local
```

ثم عدّل القيم:

```env
# Frontend
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_MAPS_API_KEY=your_maps_api_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_key

# Backend (server/.env)
PORT=3001
MONGODB_URI=mongodb://localhost:27017/alma-world
JWT_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret
```

### 2. الحصول على API Keys

#### Google Gemini AI
1. زر [Google AI Studio](https://makersuite.google.com/app/apikey)
2. أنشئ مفتاح API جديد
3. ضعه في `VITE_GEMINI_API_KEY`

#### Google Maps API
1. زر [Google Cloud Console](https://console.cloud.google.com/)
2. فعّل Maps JavaScript API
3. أنشئ Credentials
4. ضعه في `VITE_GOOGLE_MAPS_API_KEY`

#### Stripe (للدفع)
1. سجّل في [Stripe](https://stripe.com)
2. احصل على Test API Keys
3. ضعها في المتغيرات

---

## 🎮 تشغيل المشروع

### تشغيل Frontend فقط

```bash
npm run dev
```

سيعمل التطبيق على: `http://localhost:5173`

### تشغيل Frontend + Backend معاً

```bash
npm run dev:full
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`

### تشغيل Backend فقط

```bash
npm run server
```

---

## 📦 البناء والنشر

### بناء Production

```bash
npm run build
```

الملفات ستكون في مجلد `dist/`

### معاينة Production Build

```bash
npm run preview
```

### النشر

#### Vercel (Frontend)
```bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel --prod
```

#### Heroku (Backend)
```bash
# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create alma-world-api

# رفع الكود
git push heroku main
```

#### Docker
```bash
# Build
docker build -t alma-world .

# Run
docker run -p 5173:5173 alma-world
```

---

## 📚 API Documentation

### Authentication

#### POST `/api/auth/register`
تسجيل مستخدم جديد

```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "phone": "01234567890",
  "password": "password123"
}
```

#### POST `/api/auth/login`
تسجيل الدخول

```json
{
  "email": "ahmed@example.com",
  "password": "password123"
}
```

### Products

#### GET `/api/products`
الحصول على المنتجات

Query Parameters:
- `vertical`: store | restaurant | sweets | services | wholesale
- `category`: معرف الفئة
- `page`: رقم الصفحة (افتراضي: 1)
- `limit`: عدد النتائج (افتراضي: 20)
- `sortBy`: price | rating | popularity
- `minPrice`, `maxPrice`: نطاق السعر

#### GET `/api/products/:id`
تفاصيل منتج

### Orders

#### POST `/api/orders`
إنشاء طلب جديد

```json
{
  "items": [...],
  "deliveryAddress": {...},
  "paymentMethod": "cash"
}
```

#### GET `/api/orders/my-orders`
طلبات المستخدم

#### GET `/api/orders/track/:orderNumber`
تتبع الطلب

---

## 🤝 المساهمة

نرحب بمساهماتك! يرجى اتباع الخطوات التالية:

1. Fork المشروع
2. أنشئ فرع جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للفرع (`git push origin feature/amazing-feature`)
5. افتح Pull Request

### إرشادات المساهمة

- اكتب كود نظيف ومنظم
- اتبع معايير TypeScript
- أضف تعليقات للكود المعقد
- اختبر التغييرات قبل PR
- حدّث الـ README إذا لزم الأمر

---

## 🐛 الإبلاغ عن المشاكل

إذا وجدت مشكلة، يرجى [فتح Issue](https://github.com/your-username/alma-world-pro/issues) مع:

- وصف المشكلة
- خطوات إعادة إنتاج المشكلة
- السلوك المتوقع والفعلي
- لقطات الشاشة (إن وجدت)
- معلومات البيئة

---

## 📝 To-Do List

- [ ] إضافة اختبارات Unit Tests
- [ ] تحسين SEO
- [ ] دعم المزيد من اللغات
- [ ] تطبيق iOS/Android بـ React Native
- [ ] تكامل مع المزيد من بوابات الدفع
- [ ] نظام النقاط والمكافآت
- [ ] برنامج الولاء
- [ ] Live Chat مع الدعم الفني

---

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 👨‍💻 المطور

**Alaa Ali**

- GitHub: [@alaa8ali](https://github.com/alaa8ali)
- Facebook: [Alaa Ali](https://www.facebook.com/share/17nmNwNY3X/)
- WhatsApp: [+963983012001](https://wa.me/963983012001)
- Telegram: [@alaa_ali_z](https://t.me/alaa_ali_z)
- Instagram: [@a1aa_m_ali](https://www.instagram.com/a1aa_m_ali)

---

## 🙏 شكر خاص

- Google Gemini AI
- React Team
- Vercel
- جميع المساهمين في المكتبات مفتوحة المصدر

---

## 💡 ملاحظات

- هذا المشروع تعليمي/تجريبي
- للاستخدام التجاري، تحتاج لترخيص APIs
- تأكد من تغيير جميع المفاتيح السرية في Production

---

<div align="center">

**صُنع بـ ❤️ في سوريا**

⭐ إذا أعجبك المشروع، لا تنسَ إعطائه نجمة!

[🏠 الصفحة الرئيسية](#-alma-world---منصة-سحابية-شاملة-متعددة-الخدمات) • [⬆️ العودة للأعلى](#)

</div>
