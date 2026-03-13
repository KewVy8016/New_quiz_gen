# 🔧 แก้ปัญหา localStorage บน Vercel

## ปัญหาที่พบ

เมื่อ deploy ขึ้น Vercel ระบบยังใช้ localStorage แทนที่จะบันทึกใน Blob Storage

## สาเหตุ

1. Frontend fallback ไป localStorage ง่ายเกินไป
2. Blob Storage API ใช้งานไม่ถูกต้อง
3. ไม่มี API endpoint สำหรับดึงรายการ quiz

## การแก้ไข

### 1. ปรับปรุง `js/upload.js`

✅ เพิ่ม logging เพื่อ debug
✅ แยก network error กับ server error
✅ Fallback localStorage เฉพาะเมื่อ server ไม่พร้อม
✅ Clear localStorage เมื่ออัปโหลดสำเร็จ

```javascript
// ตอนนี้จะ fallback localStorage เฉพาะเมื่อ:
// - Network error (server ไม่ตอบสนอง)
// - ไม่ใช่ server error (400, 500, etc.)
```

### 2. แก้ไข `api/upload.js`

✅ ใช้ `list()` API จาก @vercel/blob
✅ สร้าง quiz-list.json ใน Blob Storage
✅ ใช้ `addRandomSuffix: false` เพื่อ URL คงที่
✅ เพิ่ม logging สำหรับ debug

```javascript
// Upload quiz
await put(`quizzes/${quizId}.json`, content, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false
});

// Update quiz-list
await put('quiz-list.json', content, {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false
});
```

### 3. สร้าง `api/quiz-list.js` (ใหม่)

✅ API endpoint สำหรับดึงรายการ quiz
✅ รองรับทั้ง local และ Vercel
✅ Auto-detect environment

```javascript
GET /api/quiz-list

Response:
{
    "success": true,
    "quizzes": [...],
    "source": "blob-storage" | "local"
}
```

### 4. ปรับปรุง `js/library.js`

✅ ใช้ `/api/quiz-list` เป็นหลัก
✅ Fallback ไป local file
✅ localStorage ใช้เฉพาะ non-server-backed quizzes
✅ ลบ duplicate quizzes

### 5. อัปเดต `server.js`

✅ เพิ่ม `/api/quiz-list` endpoint
✅ Return quiz list จาก `json/quiz-list.json`

## วิธีทดสอบ

### Local
```bash
npm start
# เปิด http://localhost:3000
# เปิด Console (F12)
# อัปโหลดข้อสอบ
# ดู logs:
# ✓ Quiz uploaded to server successfully
# ✓ Cleared localStorage version
```

### Vercel
```bash
vercel --prod
# เปิด deployed URL
# เปิด Console (F12)
# อัปโหลดข้อสอบ
# ดู logs:
# ✓ Quiz uploaded to Blob: https://...
# ✓ Quiz list updated: https://...
```

## การตรวจสอบ

### ตรวจสอบว่าใช้ Blob Storage จริง

1. เปิด Console (F12)
2. อัปโหลดข้อสอบ
3. ดู logs ต้องเห็น:
   ```
   Uploading to /api/upload...
   Response status: 200
   ✓ Quiz uploaded to server successfully
   ✓ Cleared localStorage version
   ```

4. ตรวจสอบ localStorage:
   ```javascript
   localStorage.getItem('uploadedQuizzes')
   // ต้องเป็น {} หรือไม่มี quiz ที่ serverBacked: true
   ```

5. ตรวจสอบ Vercel Dashboard:
   - ไปที่ Storage → Blob
   - ต้องเห็นไฟล์:
     - `quizzes/ชื่อข้อสอบ.json`
     - `quiz-list.json`

## สรุป

✅ **Local:** บันทึกใน `json/` folder  
✅ **Vercel:** บันทึกใน Blob Storage  
✅ **localStorage:** ใช้เฉพาะเมื่อ server ไม่พร้อม  
✅ **API:** `/api/quiz-list` สำหรับดึงรายการ  
✅ **Logging:** เพิ่ม console.log เพื่อ debug  

## ข้อควรระวัง

⚠️ **ต้องตั้งค่า Environment Variable:**
```
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

⚠️ **ตรวจสอบ Console logs:**
- ถ้าเห็น "Server upload failed" → มีปัญหา
- ถ้าเห็น "✓ Quiz uploaded to server successfully" → ใช้งานได้

⚠️ **Clear localStorage เก่า:**
```javascript
localStorage.removeItem('uploadedQuizzes')
```
