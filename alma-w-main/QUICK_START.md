# 🚀 دليل البدء السريع - ALMA World Pro

## 📥 التحميل والتثبيت

### 1. فك الضغط
```bash
tar -xzf alma-world-pro-complete.tar.gz
cd alma-world-pro
```

### 2. تثبيت Frontend Dependencies
```bash
npm install
```

### 3. تثبيت Backend Dependencies
```bash
cd server
npm install
cd ..
```

## ⚙️ الإعداد السريع

### 1. إنشاء ملف .env.local
```bash
cp .env.example .env.local
```

عدّل الملف وأضف:
```env
VITE_API_URL=http://localhost:3001/api
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_GOOGLE_MAPS_API_KEY=your_maps_key
```

### 2. إنشاء ملف server/.env
```bash
cd server
cat > .env << 'ENVEOF'
PORT=3001
MONGODB_URI=mongodb://localhost:27017/alma-world
JWT_SECRET=alma_world_secret_key_2024
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
ENVEOF
cd ..
```

## 🏃‍♂️ التشغيل

### الطريقة الأولى: تشغيل Frontend فقط
```bash
npm run dev
```
افتح المتصفح على: http://localhost:5173

### الطريقة الثانية: Frontend + Backend معاً
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
cd server
npm run dev
```

## 📝 الخطوات التالية

الآن يمكنك البدء في:
1. ✅ إنشاء المكونات (Components)
2. ✅ إنشاء الصفحات (Pages)
3. ✅ إنشاء Models و Controllers في Backend
4. ✅ ربط Frontend بـ Backend
5. ✅ إضافة البيانات التجريبية

## 📚 الوثائق

- `README.md` - دليل شامل
- `DEPLOYMENT.md` - دليل النشر
- `CONTRIBUTING.md` - دليل المساهمة
- `PROJECT_OVERVIEW.md` - نظرة شاملة

## 🆘 المساعدة

إذا واجهت مشاكل:
1. راجع الوثائق
2. تحقق من console للأخطاء
3. تأكد من تثبيت جميع Dependencies
4. تأكد من تشغيل MongoDB

---

**جاهز للبدء! 🎉**
