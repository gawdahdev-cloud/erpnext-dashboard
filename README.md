# 🏛️ منصة جودة التعليم — ERPNext Dashboard

داشبورد لإدارة ومراقبة المؤسسات التعليمية عبر ERPNext.

## ⚡ تشغيل سريع

```bash
npm install
npm run dev
```

ثم افتح http://localhost:3000

## 🔐 الاتصال بـ ERPNext

الداشبورد يستخدم **API Key + Secret** للاتصال.

### كيف تحصل على API Key؟
1. افتح ERPNext → Settings → My Profile
2. اذهب إلى قسم **"API Access"**
3. اضغط **"Generate Keys"**
4. انسخ الـ API Key والـ API Secret

### تفعيل CORS في ERPNext
افتح: **Setup → System Settings → Security**

أضف دومين موقعك في: `Allow CORS`

مثال: `http://localhost:3000`

---

## 📁 هيكل المشروع

```
src/
├── lib/
│   └── frappe.js        ← إعداد الـ SDK ودوال جلب البيانات
├── components/
│   ├── Logo.jsx          ← لوجو المنصة
│   ├── Settings.jsx      ← صفحة إعداد الاتصال
│   ├── Dashboard.jsx     ← الداشبورد الرئيسي
│   ├── CompanyCard.jsx   ← كارد الشركة
│   └── CompanyDetail.jsx ← صفحة تفاصيل الشركة
└── App.jsx
```

## 🎨 الألوان

- **أخضر**: `#36B54A`
- **أزرق**: `#27ADE1`

## 📊 البيانات المعروضة

- ✅ قائمة كل الشركات (Companies)
- ✅ فواتير المبيعات (Sales Invoices)
- ✅ فواتير المشتريات (Purchase Invoices)
- ✅ إجمالي المبيعات والمشتريات
- ✅ صافي الأرباح
- ✅ نسبة التحصيل
- ✅ رسوم بيانية شهرية (Area Chart + Bar Chart)
- ✅ جدول الفواتير مع الحالة

## 🚀 النشر

```bash
npm run build
# ثم ارفع مجلد dist/ على أي hosting
```
