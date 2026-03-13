# 🔧 ตั้งค่า Vercel Blob Storage

## ปัญหา

```
Vercel Blob: No token found. Either configure the `BLOB_READ_WRITE_TOKEN` 
environment variable, or pass a `token` option to your calls.
```

## สาเหตุ

ยังไม่ได้สร้าง Blob Storage และตั้งค่า Environment Variable

## วิธีแก้ไข

### ขั้นตอนที่ 1: สร้าง Blob Storage

1. ไปที่ https://vercel.com/dashboard
2. เลือก Project ของคุณ
3. ไปที่ **Storage** tab (ด้านบน)
4. คลิก **Create Database**
5. เลือก **Blob**
6. คลิก **Continue**
7. ตั้งชื่อ (เช่น "quizflow-storage")
8. เลือก Region (แนะนำ: ใกล้ที่สุด)
9. คลิก **Create**

### ขั้นตอนที่ 2: Connect to Project

1. หลังจากสร้าง Blob Storage แล้ว
2. คลิก **Connect to Project**
3. เลือก Project ของคุณ
4. คลิก **Connect**

Vercel จะตั้งค่า Environment Variable `BLOB_READ_WRITE_TOKEN` ให้อัตโนมัติ!

### ขั้นตอนที่ 3: Redeploy

หลังจาก connect แล้ว ต้อง redeploy เพื่อให้ environment variable มีผล:

```bash
vercel --prod
```

หรือใน Vercel Dashboard:
1. ไปที่ Deployments
2. คลิก ... (three dots) ที่ deployment ล่าสุด
3. คลิก **Redeploy**

### ขั้นตอนที่ 4: ทดสอบ

1. เปิด deployed URL
2. เปิด Console (F12)
3. อัปโหลดข้อสอบ
4. ต้องเห็น:
   ```
   ✓ Quiz uploaded to server successfully
   ✓ Cleared localStorage version
   ```

## ตรวจสอบว่าตั้งค่าสำเร็จ

### วิธีที่ 1: ใน Vercel Dashboard

1. Project Settings → Environment Variables
2. ต้องเห็น: `BLOB_READ_WRITE_TOKEN` (ค่าจะถูกซ่อน)

### วิธีที่ 2: ดู Deployment Logs

```bash
vercel logs
```

ต้องไม่เห็น error เกี่ยวกับ "No token found"

### วิธีที่ 3: ทดสอบอัปโหลด

อัปโหลดข้อสอบและดู Console logs

## ถ้ายังไม่ได้

### ปัญหา: Environment Variable ไม่มีผล

**สาเหตุ:** ยังไม่ได้ redeploy

**แก้:** 
```bash
vercel --prod
```

### ปัญหา: ไม่เห็น Storage tab

**สาเหตุ:** อาจเป็น Hobby plan ที่ไม่รองรับ

**แก้:** 
- ตรวจสอบ plan ของคุณ
- Blob Storage รองรับ Hobby plan (ฟรี)

### ปัญหา: Connect to Project ไม่ได้

**สาเหตุ:** Project อาจไม่ได้ deploy แล้ว

**แก้:**
```bash
vercel --prod
```
แล้วลอง connect อีกครั้ง

## Alternative: ตั้งค่า Manual

ถ้าไม่สามารถสร้าง Blob Storage ได้:

### 1. สร้าง Token Manual

```bash
vercel blob create
```

### 2. เพิ่ม Environment Variable

1. Project Settings → Environment Variables
2. คลิก **Add New**
3. Name: `BLOB_READ_WRITE_TOKEN`
4. Value: (paste token ที่ได้)
5. Environment: Production, Preview, Development
6. คลิก **Save**

### 3. Redeploy

```bash
vercel --prod
```

## สรุป

✅ สร้าง Blob Storage ใน Vercel Dashboard  
✅ Connect to Project  
✅ Redeploy  
✅ ทดสอบอัปโหลด  

หลังจากนี้ระบบจะบันทึกใน Blob Storage แทน localStorage!

## หมายเหตุ

- Blob Storage ฟรี 1GB สำหรับ Hobby plan
- ไฟล์ quiz มีขนาดเล็กมาก (< 100KB)
- สามารถเก็บข้อสอบได้หลายพันชุด
