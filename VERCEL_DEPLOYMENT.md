# 🚀 Vercel Deployment Guide

## การ Deploy ขึ้น Vercel

### ขั้นตอนที่ 1: ติดตั้ง Vercel CLI

```bash
npm install -g vercel
```

### ขั้นตอนที่ 2: Login เข้า Vercel

```bash
vercel login
```

### ขั้นตอนที่ 3: Deploy โปรเจค

```bash
vercel
```

หรือ deploy แบบ production:

```bash
vercel --prod
```

### ขั้นตอนที่ 4: ตั้งค่า Environment Variables

ไปที่ Vercel Dashboard → Project Settings → Environment Variables

เพิ่ม:
- `BLOB_READ_WRITE_TOKEN` - สำหรับ Vercel Blob Storage

**วิธีสร้าง Blob Storage Token:**
1. ไปที่ Vercel Dashboard
2. เลือก Project
3. ไปที่ Storage → Create Database → Blob
4. Copy token ที่ได้

---

## การทำงานบน Vercel

### Local Development (npm start)
- ข้อสอบบันทึกใน `json/` folder
- ใช้ `quiz-list.json` ในโฟลเดอร์

### Vercel Production
- ข้อสอบบันทึกใน **Vercel Blob Storage**
- `quiz-list.json` บันทึกใน Blob Storage
- Serverless Functions จัดการ upload

---

## โครงสร้างการทำงาน

```
Local (npm start)
├── Upload → json/quiz-name.json
└── List → json/quiz-list.json

Vercel Production
├── Upload → Blob Storage (quizzes/quiz-name.json)
└── List → Blob Storage (quiz-list.json)
```

---

## ข้อควรระวัง

⚠️ **Vercel Serverless Functions มี read-only filesystem**
- ไม่สามารถเขียนไฟล์ลง `json/` ได้
- ต้องใช้ Blob Storage แทน

✅ **ระบบจะ auto-detect environment:**
- Local: บันทึกเป็นไฟล์
- Vercel: บันทึกใน Blob Storage

---

## การทดสอบก่อน Deploy

```bash
# ทดสอบ local
npm start

# ทดสอบ Vercel environment
vercel dev
```

---

## ปัญหาที่อาจเจอ

### 1. Upload ไม่ทำงานบน Vercel
- ตรวจสอบว่าตั้งค่า `BLOB_READ_WRITE_TOKEN` แล้ว
- ดู logs: `vercel logs`

### 2. Quiz list ว่างเปล่า
- ตรวจสอบว่า Blob Storage มี `quiz-list.json`
- ลอง upload quiz ใหม่

### 3. CORS Error
- Vercel จัดการ CORS อัตโนมัติ
- ถ้ายังมีปัญหา ตรวจสอบ `vercel.json`

---

## ไฟล์สำคัญสำหรับ Vercel

- `vercel.json` - Vercel configuration
- `api/upload.js` - Serverless function สำหรับ upload
- `package.json` - Dependencies

---

## คำสั่งที่เป็นประโยชน์

```bash
# Deploy
vercel --prod

# ดู logs
vercel logs

# ลบ deployment
vercel remove [deployment-url]

# ดู environment variables
vercel env ls
```
