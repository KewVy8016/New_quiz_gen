# ⚡ แก้ปัญหาด่วน: ไม่มี BLOB_READ_WRITE_TOKEN

## ปัญหา

```
Vercel Blob: No token found
```

## แก้ไขใน 4 ขั้นตอน

### 1️⃣ ไปที่ Vercel Dashboard
https://vercel.com/dashboard

### 2️⃣ เลือก Project → Storage → Create Database → Blob

### 3️⃣ Connect to Project
เลือก project ของคุณและคลิก Connect

### 4️⃣ Redeploy
```bash
vercel --prod
```

## เสร็จแล้ว! 🎉

ตอนนี้อัปโหลดข้อสอบจะบันทึกใน Blob Storage แทน localStorage

---

## ถ้ายังไม่ได้

ดูคำแนะนำละเอียดใน: `SETUP_VERCEL_BLOB.md`

## ทดสอบว่าใช้งานได้

1. เปิด deployed URL
2. กด F12 (Console)
3. อัปโหลดข้อสอบ
4. ต้องเห็น: `✓ Quiz uploaded to server successfully`

---

## สำหรับ Local Development

ไม่ต้องตั้งค่าอะไร แค่รัน:
```bash
npm start
```

มันจะบันทึกเป็นไฟล์ใน `json/` โดยอัตโนมัติ
