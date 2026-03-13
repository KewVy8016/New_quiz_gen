# 📋 สรุปการ Deploy และการทำงาน

## ✅ ระบบพร้อม Deploy บน Vercel แล้ว!

### การทำงานของระบบ

#### 🏠 Local Development (npm start)
```bash
npm start
# เปิด http://localhost:3000
```

**การทำงาน:**
- ใช้ `server.js` (Node.js HTTP Server)
- บันทึกข้อสอบเป็นไฟล์จริงใน `json/`
- อัปเดต `json/quiz-list.json` อัตโนมัติ
- ไม่ใช้ localStorage (เว้นแต่ server ล้มเหลว)

**ข้อดี:**
- ข้อสอบเป็นไฟล์จริง ไม่หาย
- แก้ไขไฟล์ได้โดยตรง
- เหมาะสำหรับ development

---

#### ☁️ Vercel Production
```bash
vercel --prod
```

**การทำงาน:**
- ใช้ Serverless Functions (`api/upload.js`)
- บันทึกข้อสอบใน **Vercel Blob Storage**
- `quiz-list.json` อยู่ใน Blob Storage
- ไม่ใช้ localStorage (เว้นแต่ API ล้มเหลว)

**ข้อดี:**
- Scalable และ serverless
- ไม่ต้องจัดการ server
- Auto-scaling

---

## 🎯 ฟีเจอร์ที่เพิ่มเข้ามา

### 1. ตั้งชื่อข้อสอบก่อนอัปโหลด ✨
- แสดง modal ให้กรอกชื่อ
- ชื่อเริ่มต้นจากชื่อไฟล์
- รองรับภาษาไทย
- กด Enter ยืนยัน, Escape ยกเลิก

### 2. บันทึกเป็นไฟล์จริง (Local) 💾
- รัน `npm start` เพื่อใช้ local server
- ข้อสอบบันทึกใน `json/`
- ไม่หายแม้ clear browser

### 3. รองรับ Vercel Deployment ☁️
- Auto-detect environment
- ใช้ Blob Storage บน Vercel
- Serverless Functions

---

## 📁 โครงสร้างไฟล์

```
QuizFlow/
├── api/
│   └── upload.js          # Serverless function (Vercel)
├── js/
│   ├── upload.js          # Frontend upload logic
│   └── library.js         # Quiz list management
├── json/
│   ├── quiz-list.json     # Quiz metadata (local)
│   └── *.json             # Quiz files (local)
├── server.js              # Local dev server
├── vercel.json            # Vercel config
├── package.json
├── START_HERE.md          # คำแนะนำเริ่มต้น
├── UPLOAD_GUIDE.md        # คู่มือการอัปโหลด
├── VERCEL_DEPLOYMENT.md   # คู่มือ deploy Vercel
└── sample-quiz.json       # ไฟล์ตัวอย่าง
```

---

## 🚀 วิธีใช้งาน

### สำหรับ Development
```bash
npm start
# เปิด http://localhost:3000
```

### สำหรับ Production (Vercel)
```bash
# ครั้งแรก
vercel

# Deploy production
vercel --prod
```

### ตั้งค่า Vercel Blob Storage
1. ไปที่ Vercel Dashboard
2. เลือก Project → Storage → Create Blob
3. Copy `BLOB_READ_WRITE_TOKEN`
4. เพิ่มใน Environment Variables

---

## 🔄 Flow การอัปโหลด

```
User clicks "Upload New Quiz"
    ↓
Modal แสดงให้กรอกชื่อ
    ↓
User กรอกชื่อและเลือกไฟล์
    ↓
Frontend validate format
    ↓
┌─────────────────┬─────────────────┐
│   Local Mode    │  Vercel Mode    │
├─────────────────┼─────────────────┤
│ POST /api/upload│ POST /api/upload│
│ server.js       │ api/upload.js   │
│ Save to json/   │ Save to Blob    │
│ Update list     │ Update Blob list│
└─────────────────┴─────────────────┘
    ↓
Success → Reload page
```

---

## ⚙️ Environment Detection

ระบบจะ auto-detect environment:

```javascript
// Local
!process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN

// Vercel
process.env.VERCEL || process.env.BLOB_READ_WRITE_TOKEN
```

---

## 📝 สรุป

✅ **Local Development:** ใช้ `npm start` → บันทึกเป็นไฟล์  
✅ **Vercel Production:** ใช้ `vercel --prod` → บันทึกใน Blob Storage  
✅ **Fallback:** ถ้า API ล้มเหลว → ใช้ localStorage  
✅ **Custom Name:** กรอกชื่อข้อสอบก่อนอัปโหลด  
✅ **Thai Support:** รองรับภาษาไทยในชื่อข้อสอบ  

---

## 🎉 พร้อมใช้งาน!

ระบบพร้อม deploy บน Vercel แล้ว ทั้ง local และ production จะทำงานได้ถูกต้อง!
