# 🔍 Debug Upload Process

## ขั้นตอนการ Debug

### 1. เปิด Console (F12)

กด F12 เพื่อเปิด Developer Tools

### 2. ไปที่ Tab Console

ดู logs ทั้งหมด

### 3. อัปโหลดข้อสอบ

1. คลิก "Upload New Quiz"
2. กรอกชื่อ (เช่น "ทดสอบ")
3. เลือกไฟล์ `sample-quiz.json`
4. คลิก "อัปโหลด"

### 4. ดู Logs ที่ควรเห็น

#### ✅ สำเร็จ (Blob Storage):
```
Uploading to /api/upload...
Response status: 200
✓ Quiz uploaded to server successfully: {
    success: true,
    message: "Quiz uploaded successfully (Vercel Blob)",
    quiz: {...},
    quizListUrl: "https://...",
    location: "vercel-blob"
}
✓ Cleared localStorage version
Quiz uploaded successfully! Refreshing library...
```

#### ✅ สำเร็จ (Local):
```
Uploading to /api/upload...
Response status: 200
✓ Quiz uploaded to server successfully: {
    success: true,
    message: "Quiz uploaded successfully (local)",
    quiz: {...},
    location: "local"
}
✓ Cleared localStorage version
Quiz uploaded successfully! Refreshing library...
```

#### ❌ ล้มเหลว (Network Error):
```
Uploading to /api/upload...
❌ Server upload failed: TypeError: Failed to fetch
⚠️ Server not available, using localStorage fallback
Quiz uploaded successfully! Refreshing library...
```

#### ❌ ล้มเหลว (Server Error):
```
Uploading to /api/upload...
Response status: 500
❌ Server upload failed: Error: Upload failed (500): ...
Upload failed: Upload failed (500): ...
```

### 5. ตรวจสอบ Network Tab

1. ไปที่ Tab "Network"
2. Filter: "Fetch/XHR"
3. หา request `/api/upload`
4. คลิกดู:
   - Status: ต้องเป็น 200
   - Response: ดู JSON response
   - Preview: ดูข้อมูลที่ return

### 6. ตรวจสอบ localStorage

ใน Console พิมพ์:
```javascript
JSON.parse(localStorage.getItem('uploadedQuizzes') || '{}')
```

**ถ้าอัปโหลดสำเร็จ:** ต้องเป็น `{}` หรือไม่มี quiz ที่ `serverBacked: true`

**ถ้าใช้ localStorage:** จะเห็น quiz ที่ `serverBacked: false`

### 7. ตรวจสอบ Vercel Dashboard

1. ไปที่ https://vercel.com/dashboard
2. เลือก Project
3. ไปที่ Storage → Blob
4. ต้องเห็นไฟล์:
   - `quizzes/ทดสอบ.json`
   - `quiz-list.json`

### 8. ตรวจสอบ Environment Variables

ใน Vercel Dashboard:
1. Project Settings → Environment Variables
2. ต้องมี: `BLOB_READ_WRITE_TOKEN`
3. ถ้าไม่มี → ต้องสร้าง Blob Storage ก่อน

## สาเหตุที่เป็นไปได้

### ❌ ไม่มี BLOB_READ_WRITE_TOKEN
```
Error: Missing BLOB_READ_WRITE_TOKEN
```
**แก้:** ตั้งค่า Environment Variable

### ❌ API ไม่ทำงาน
```
Response status: 404
```
**แก้:** ตรวจสอบว่า deploy แล้ว

### ❌ Validation Error
```
Response status: 400
Invalid quiz format
```
**แก้:** ตรวจสอบ format ของไฟล์ JSON

### ❌ CORS Error
```
Access to fetch at '...' has been blocked by CORS policy
```
**แก้:** Vercel จัดการ CORS อัตโนมัติ แต่ถ้ายังมีปัญหา ตรวจสอบ `vercel.json`

## คำสั่งที่เป็นประโยชน์

### ดู Vercel Logs
```bash
vercel logs
```

### ดู Blob Storage
```bash
vercel blob ls
```

### Clear localStorage
```javascript
localStorage.clear()
location.reload()
```

### ทดสอบ API โดยตรง
```javascript
fetch('/api/quiz-list')
  .then(r => r.json())
  .then(console.log)
```

## ถ้ายังไม่ได้

1. ลอง deploy ใหม่: `vercel --prod`
2. Clear browser cache
3. ลองใน Incognito mode
4. ตรวจสอบ Vercel logs: `vercel logs`
