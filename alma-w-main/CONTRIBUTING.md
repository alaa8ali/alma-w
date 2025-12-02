# 🤝 دليل المساهمة - ALMA World

شكراً لاهتمامك بالمساهمة في ALMA World! نحن نرحب بجميع أنواع المساهمات.

---

## 📋 جدول المحتويات

- [كيف يمكنني المساهمة؟](#-كيف-يمكنني-المساهمة)
- [الإبلاغ عن الأخطاء](#-الإبلاغ-عن-الأخطاء)
- [اقتراح ميزات جديدة](#-اقتراح-ميزات-جديدة)
- [عملية Pull Request](#-عملية-pull-request)
- [معايير الكود](#-معايير-الكود)
- [معايير Commit](#-معايير-commit)
- [بيئة التطوير](#-بيئة-التطوير)

---

## 💡 كيف يمكنني المساهمة؟

هناك عدة طرق للمساهمة:

### 🐛 الإبلاغ عن الأخطاء
إذا وجدت خطأ، يرجى [فتح Issue جديد](https://github.com/your-username/alma-world-pro/issues/new?template=bug_report.md)

### ✨ اقتراح ميزات
لديك فكرة رائعة؟ [اقترح ميزة جديدة](https://github.com/your-username/alma-world-pro/issues/new?template=feature_request.md)

### 📝 تحسين الوثائق
الوثائق بحاجة لتحسين؟ شارك بتحديثها!

### 💻 كتابة الكود
راجع [Issues المفتوحة](https://github.com/your-username/alma-world-pro/issues) واختر ما يناسبك

### 🌐 الترجمة
ساعدنا في دعم المزيد من اللغات

---

## 🐛 الإبلاغ عن الأخطاء

عند الإبلاغ عن خطأ، يرجى تضمين:

### ✅ Checklist

- [ ] عنوان واضح ووصفي
- [ ] خطوات إعادة إنتاج الخطأ
- [ ] السلوك المتوقع
- [ ] السلوك الفعلي
- [ ] لقطات شاشة (إن وجدت)
- [ ] معلومات البيئة

### 📝 Template

```markdown
## وصف الخطأ
وصف واضح ومختصر للخطأ.

## خطوات إعادة الإنتاج
1. اذهب إلى '...'
2. اضغط على '...'
3. شاهد الخطأ

## السلوك المتوقع
ما الذي كان من المفترض أن يحدث؟

## السلوك الفعلي
ما الذي حدث بالفعل؟

## لقطات الشاشة
إذا كان ذلك مناسباً، أضف لقطات شاشة.

## معلومات البيئة
- OS: [مثلاً iOS 15.0]
- Browser: [مثلاً Chrome 95]
- Version: [مثلاً 2.0.0]

## معلومات إضافية
أي معلومات أخرى مفيدة.
```

---

## ✨ اقتراح ميزات جديدة

### ✅ Checklist

- [ ] تحقق من أن الميزة غير موجودة
- [ ] تحقق من عدم اقتراحها سابقاً
- [ ] وضح فائدة الميزة
- [ ] اقترح طريقة التنفيذ

### 📝 Template

```markdown
## وصف الميزة
وصف واضح للميزة المقترحة.

## المشكلة التي تحلها
ما المشكلة التي تحلها هذه الميزة؟

## الحل المقترح
كيف تقترح تنفيذ هذه الميزة؟

## البدائل المدروسة
هل فكرت في بدائل أخرى؟

## معلومات إضافية
أي معلومات أو screenshots إضافية.
```

---

## 🔄 عملية Pull Request

### 1️⃣ Fork المشروع

```bash
# Fork على GitHub ثم
git clone https://github.com/YOUR_USERNAME/alma-world-pro.git
cd alma-world-pro
git remote add upstream https://github.com/alaa8ali/alma-world-pro.git
```

### 2️⃣ إنشاء Branch جديد

```bash
git checkout -b feature/amazing-feature
# أو
git checkout -b fix/bug-fix
```

تسمية الـ Branches:
- `feature/feature-name` - للميزات الجديدة
- `fix/bug-name` - لإصلاح الأخطاء
- `docs/description` - للوثائق
- `refactor/description` - لإعادة الهيكلة
- `test/description` - للاختبارات

### 3️⃣ كتابة الكود

```bash
# اتبع معايير الكود (انظر أدناه)
# اختبر التغييرات
npm run dev
```

### 4️⃣ Commit التغييرات

```bash
git add .
git commit -m "feat: add amazing feature"
```

(انظر [معايير Commit](#-معايير-commit))

### 5️⃣ Push للـ Branch

```bash
git push origin feature/amazing-feature
```

### 6️⃣ فتح Pull Request

1. اذهب إلى GitHub
2. اضغط "New Pull Request"
3. اختر branch الخاص بك
4. املأ Template:

```markdown
## الوصف
وصف واضح للتغييرات.

## النوع
- [ ] ميزة جديدة
- [ ] إصلاح خطأ
- [ ] تحسين
- [ ] وثائق
- [ ] أخرى

## الاختبارات
- [ ] تم اختبار التغييرات
- [ ] جميع الاختبارات تعمل
- [ ] تمت إضافة اختبارات جديدة

## Screenshots
إذا كان ذلك مناسباً.

## Checklist
- [ ] الكود يتبع معايير المشروع
- [ ] تم تحديث الوثائق
- [ ] لا توجد warnings في console
- [ ] تم اختبار التغييرات
```

### 7️⃣ Code Review

- سيتم مراجعة الكود
- قد يُطلب منك إجراء تعديلات
- كن صبوراً ومتعاوناً

---

## 📏 معايير الكود

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

const getUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// ❌ Bad
const getUser = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};
```

### React Components

```typescript
// ✅ Good - Functional Component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const Button: React.FC<ButtonProps> = ({ 
  label, 
  onClick, 
  variant = 'primary' 
}) => {
  return (
    <button 
      className={`btn-${variant}`} 
      onClick={onClick}
    >
      {label}
    </button>
  );
};

export default Button;
```

### Naming Conventions

```typescript
// Variables & Functions - camelCase
const userName = 'Ahmad';
const getUserData = () => {};

// Components - PascalCase
const UserCard = () => {};
const ProductList = () => {};

// Constants - UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// Types & Interfaces - PascalCase
interface UserData {}
type OrderStatus = 'pending' | 'completed';

// Files
// Components: PascalCase.tsx
UserCard.tsx
ProductList.tsx

// Others: camelCase.ts
authService.ts
cartStore.ts
```

### Import Order

```typescript
// 1. React & External Libraries
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// 2. Internal Components
import Button from '@components/common/Button';
import Card from '@components/common/Card';

// 3. Stores & Hooks
import { useAuthStore } from '@store/authStore';
import { useCart } from '@hooks/useCart';

// 4. Services & Utils
import { productService } from '@services/productService';
import { formatPrice } from '@utils/formatters';

// 5. Types
import type { Product, User } from '@types/index';

// 6. Styles
import './styles.css';
```

### CSS/Tailwind

```tsx
// ✅ Good - منظم ومقروء
<div className="
  flex items-center justify-between
  px-4 py-3
  bg-white dark:bg-gray-800
  rounded-xl shadow-soft
  hover:shadow-lg transition-all
">

// ❌ Bad - غير منظم
<div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-soft hover:shadow-lg transition-all">
```

---

## 📝 معايير Commit

نستخدم [Conventional Commits](https://www.conventionalcommits.org/):

### النمط

```
<type>(<scope>): <subject>

<body>

<footer>
```

### الأنواع (Types)

- `feat`: ميزة جديدة
- `fix`: إصلاح خطأ
- `docs`: تحديث الوثائق
- `style`: تنسيق الكود (لا يؤثر على المعنى)
- `refactor`: إعادة هيكلة الكود
- `perf`: تحسين الأداء
- `test`: إضافة/تحديث الاختبارات
- `chore`: أعمال صيانة
- `ci`: تحديثات CI/CD

### أمثلة

```bash
# ميزة جديدة
git commit -m "feat(auth): add phone verification"

# إصلاح خطأ
git commit -m "fix(cart): calculate tax correctly"

# توثيق
git commit -m "docs(readme): update installation steps"

# تحسين أداء
git commit -m "perf(products): optimize image loading"

# إعادة هيكلة
git commit -m "refactor(components): extract common Button component"
```

### Body (اختياري)

```bash
git commit -m "feat(checkout): add multiple payment methods

- Added credit card payment
- Added PayPal integration  
- Added cash on delivery option

Closes #123"
```

---

## 🛠️ بيئة التطوير

### Setup

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/alma-world-pro.git
cd alma-world-pro

# Install
npm install

# Copy env
cp .env.example .env.local

# Run
npm run dev
```

### Scripts

```bash
# Development
npm run dev              # تشغيل Frontend
npm run server           # تشغيل Backend
npm run dev:full         # تشغيل الاثنين معاً

# Build
npm run build            # بناء Production

# Preview
npm run preview          # معاينة Build

# Linting (إذا كان موجود)
npm run lint             # فحص الكود
npm run lint:fix         # إصلاح تلقائي

# Testing (إذا كان موجود)
npm run test             # تشغيل الاختبارات
npm run test:watch       # Watch mode
```

### VS Code Extensions (موصى به)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "dsznajder.es7-react-js-snippets"
  ]
}
```

---

## ✅ Checklist قبل PR

- [ ] الكود يعمل بدون أخطاء
- [ ] اتبعت معايير الكود
- [ ] Commit messages واضحة
- [ ] تم تحديث الوثائق
- [ ] تم اختبار التغييرات
- [ ] لا توجد console warnings
- [ ] الكود نظيف ومنظم
- [ ] تم حذف console.logs غير الضرورية

---

## 🎯 نصائح للمساهمين الجدد

### ابدأ بـ Issues بسيطة

ابحث عن Issues بـ label:
- `good first issue` - مناسبة للمبتدئين
- `help wanted` - نحتاج مساعدة
- `documentation` - توثيق

### اطلب المساعدة

لا تتردد في طرح الأسئلة:
- في التعليقات على Issue
- في Discussion
- في Discord Server

### كن محترماً

- احترم آراء الآخرين
- كن صبوراً
- اقبل النقد البناء

---

## 📞 تواصل معنا

- 💬 Discord: [Server Link]
- 📧 Email: dev@alma-world.com
- 🐦 Twitter: [@alma_world](https://twitter.com/alma_world)

---

## 🙏 شكراً!

شكراً لمساهمتك في جعل ALMA World أفضل! 

كل مساهمة، مهما كانت صغيرة، تُحدث فرقاً. 💙

---

**صُنع بـ ❤️ من مطورين لمطورين**
