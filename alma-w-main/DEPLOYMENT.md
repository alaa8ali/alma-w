# 🚀 دليل النشر - ALMA World

هذا الدليل يشرح كيفية نشر تطبيق ALMA World على منصات مختلفة.

---

## 📋 جدول المحتويات

- [متطلبات النشر](#-متطلبات-النشر)
- [إعداد قاعدة البيانات](#-إعداد-قاعدة-البيانات)
- [النشر على Vercel (Frontend)](#-النشر-على-vercel-frontend)
- [النشر على Heroku (Backend)](#-النشر-على-heroku-backend)
- [النشر على AWS](#-النشر-على-aws)
- [النشر باستخدام Docker](#-النشر-باستخدام-docker)
- [النشر على VPS](#-النشر-على-vps)
- [إعداد Domain و SSL](#-إعداد-domain-و-ssl)
- [المراقبة والصيانة](#-المراقبة-والصيانة)

---

## ✅ متطلبات النشر

قبل النشر، تأكد من:

- [ ] جميع المتغيرات البيئية محددة
- [ ] قاعدة البيانات جاهزة ومتصلة
- [ ] API Keys صالحة (Gemini, Maps, Stripe)
- [ ] الاختبارات تعمل بنجاح
- [ ] الكود محفوظ في Git Repository

---

## 🗄️ إعداد قاعدة البيانات

### MongoDB Atlas (موصى به)

1. **إنشاء حساب**
   ```
   https://www.mongodb.com/cloud/atlas/register
   ```

2. **إنشاء Cluster**
   - اختر Free Tier (M0)
   - اختر المنطقة الأقرب لك
   - سمّ الـ Cluster: `alma-world`

3. **إعداد Database Access**
   - أنشئ مستخدم بـ username و password
   - احفظ البيانات

4. **إعداد Network Access**
   - أضف IP Address: `0.0.0.0/0` (للسماح بالوصول من أي مكان)
   - في Production، حدد IPs محددة

5. **الحصول على Connection String**
   ```
   mongodb+srv://username:password@cluster.xxxxx.mongodb.net/alma-world?retryWrites=true&w=majority
   ```

6. **اختبار الاتصال**
   ```bash
   # ضع Connection String في .env
   MONGODB_URI=mongodb+srv://...
   
   # اختبر
   node server/test-db.js
   ```

---

## ☁️ النشر على Vercel (Frontend)

### الطريقة 1: من Dashboard

1. **زيارة Vercel**
   ```
   https://vercel.com/
   ```

2. **Import Project**
   - اضغط "New Project"
   - اختر Git Repository
   - حدد `alma-world-pro`

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   ```

4. **Environment Variables**
   أضف جميع المتغيرات:
   ```
   VITE_API_URL=https://your-backend.herokuapp.com/api
   VITE_GEMINI_API_KEY=...
   VITE_GOOGLE_MAPS_API_KEY=...
   VITE_STRIPE_PUBLIC_KEY=...
   ```

5. **Deploy**
   - اضغط "Deploy"
   - انتظر حتى ينتهي البناء
   - ستحصل على URL: `https://alma-world.vercel.app`

### الطريقة 2: من CLI

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# النشر
vercel --prod

# تعيين متغيرات البيئة
vercel env add VITE_API_URL
vercel env add VITE_GEMINI_API_KEY
# ... إلخ
```

### Custom Domain

```bash
# إضافة domain مخصص
vercel domains add alma-world.com

# إعداد DNS Records
# A Record: @ -> 76.76.21.21
# CNAME: www -> cname.vercel-dns.com
```

---

## 🟪 النشر على Heroku (Backend)

### 1. التحضير

```bash
cd server

# إنشاء Procfile
echo "web: node index.js" > Procfile

# تأكد من وجود package.json
```

### 2. إنشاء تطبيق Heroku

```bash
# تسجيل الدخول
heroku login

# إنشاء تطبيق
heroku create alma-world-api

# إضافة MongoDB
heroku addons:create mongolab:sandbox
```

### 3. تعيين Environment Variables

```bash
heroku config:set PORT=3001
heroku config:set JWT_SECRET=your_secret_key
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://alma-world.vercel.app
```

### 4. النشر

```bash
# إضافة remote
heroku git:remote -a alma-world-api

# Push
git push heroku main

# فتح التطبيق
heroku open

# عرض Logs
heroku logs --tail
```

---

## 🟠 النشر على AWS

### EC2 + RDS + S3

#### 1. إنشاء EC2 Instance

```bash
# SSH إلى Instance
ssh -i keypair.pem ec2-user@ec2-xx-xx-xx-xx.compute.amazonaws.com

# تثبيت Node.js
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت Nginx
sudo apt-get install nginx

# تثبيت PM2
sudo npm install -g pm2
```

#### 2. رفع الكود

```bash
# Clone Repository
git clone https://github.com/your-username/alma-world-pro.git
cd alma-world-pro

# تثبيت Dependencies
npm install
cd server && npm install && cd ..

# Build Frontend
npm run build

# نسخ Build إلى Nginx
sudo cp -r dist/* /var/www/html/

# تشغيل Backend بـ PM2
cd server
pm2 start index.js --name alma-api
pm2 save
pm2 startup
```

#### 3. إعداد Nginx

```nginx
# /etc/nginx/sites-available/alma-world
server {
    listen 80;
    server_name alma-world.com;

    # Frontend
    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/alma-world /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🐳 النشر باستخدام Docker

### 1. إنشاء Dockerfile

```dockerfile
# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```dockerfile
# Backend Dockerfile (server/Dockerfile)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "index.js"]
```

### 2. docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    environment:
      - VITE_API_URL=http://backend:3001/api

  backend:
    build: ./server
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

### 3. البناء والتشغيل

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# عرض Logs
docker-compose logs -f

# إيقاف
docker-compose down
```

---

## 🖥️ النشر على VPS

### 1. التحضير

```bash
# SSH إلى VPS
ssh root@your-vps-ip

# تحديث النظام
apt update && apt upgrade -y

# تثبيت Node.js
curl -sL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# تثبيت Nginx
apt install -y nginx

# تثبيت MongoDB
apt install -y mongodb

# تثبيت PM2
npm install -g pm2

# تثبيت Certbot (للـ SSL)
apt install -y certbot python3-certbot-nginx
```

### 2. رفع الكود

```bash
# Clone
git clone https://github.com/your-username/alma-world-pro.git /var/www/alma-world
cd /var/www/alma-world

# Dependencies
npm install
cd server && npm install && cd ..

# Build
npm run build
```

### 3. تشغيل Backend

```bash
cd /var/www/alma-world/server

# إنشاء .env
cat > .env << EOF
PORT=3001
MONGODB_URI=mongodb://localhost:27017/alma-world
JWT_SECRET=your_secret
NODE_ENV=production
EOF

# تشغيل بـ PM2
pm2 start index.js --name alma-api
pm2 save
pm2 startup
```

### 4. إعداد Nginx

```bash
# إنشاء ملف config
nano /etc/nginx/sites-available/alma-world

# الصق الـ config من قسم AWS أعلاه

# تفعيل
ln -s /etc/nginx/sites-available/alma-world /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

---

## 🔒 إعداد Domain و SSL

### 1. ربط Domain

في لوحة تحكم Domain، أضف:

```
# A Records
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 3600

Type: A
Name: www
Value: YOUR_VPS_IP
TTL: 3600
```

### 2. تثبيت SSL Certificate

```bash
# Certbot
certbot --nginx -d alma-world.com -d www.alma-world.com

# سيتم التجديد تلقائياً
# يمكنك اختبار التجديد:
certbot renew --dry-run
```

---

## 📊 المراقبة والصيانة

### PM2 Monitoring

```bash
# عرض العمليات
pm2 list

# Monitoring
pm2 monit

# Logs
pm2 logs alma-api

# إعادة التشغيل
pm2 restart alma-api

# إيقاف
pm2 stop alma-api
```

### Backup قاعدة البيانات

```bash
# Backup
mongodump --uri="mongodb://..." --out=/backups/$(date +%Y%m%d)

# Restore
mongorestore --uri="mongodb://..." /backups/20241201

# Automated backup (cron)
crontab -e
# أضف: 0 2 * * * /path/to/backup-script.sh
```

### تحديث التطبيق

```bash
cd /var/www/alma-world

# Pull changes
git pull origin main

# Update dependencies
npm install
cd server && npm install && cd ..

# Rebuild
npm run build

# Restart backend
pm2 restart alma-api

# Reload Nginx
nginx -t && systemctl reload nginx
```

---

## 🔥 نصائح Production

### Security

- ✅ استخدم HTTPS دائماً
- ✅ غيّر جميع الـ secrets
- ✅ فعّل Firewall
- ✅ حدث النظام بانتظام
- ✅ استخدم Environment Variables

### Performance

- ✅ فعّل Gzip في Nginx
- ✅ استخدم CDN للصور
- ✅ فعّل Caching
- ✅ ضغط الصور
- ✅ Code Splitting

### Monitoring

- ✅ استخدم PM2 Plus أو Datadog
- ✅ راقب أداء قاعدة البيانات
- ✅ راقب استهلاك الموارد
- ✅ أنشئ Alerts للأخطاء

---

## 📞 الدعم

إذا واجهت مشاكل في النشر:

- 📧 Email: support@alma-world.com
- 💬 Discord: [Server Link]
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/alma-world-pro/issues)

---

**صُنع بـ ❤️ للمطورين العرب**
