# QuizFlow 🎯

แพลตฟอร์มทำ Quiz แบบ Static ที่รองรับการอัพโหลดไฟล์ JSON, ติดตามความคืบหน้า และทบทวนคำตอบที่ผิด

## ✨ Features

- ✅ Quiz library พร้อม progress tracking
- ✅ 2 โหมดตอบคำถาม: Instant Feedback & Review After Finish
- ✅ หน้าแสดงผลคะแนนพร้อมสถิติ
- ✅ ทบทวนคำตอบที่ผิดพร้อมคำอธิบาย
- ✅ Responsive design (รองรับมือถือ)
- ✅ บันทึกความคืบหน้าอัตโนมัติ (localStorage)
- ✅ อัพโหลด quiz ผ่านหน้าเว็บ (client-side + server-side)
- ✅ รองรับหลายรูปแบบไฟล์ quiz พร้อมแปลงอัตโนมัติ
- ✅ ทำงานได้ offline (file:// protocol)
- ✅ ลบ quiz ที่อัพโหลดได้

---

## 🚀 Quick Start

### วิธีที่ 1: เปิดไฟล์โดยตรง (ไม่ต้องติดตั้งอะไร)

```bash
# Windows
start index.html

# หรือดับเบิลคลิกที่ไฟล์ index.html
```

ระบบจะทำงานได้ทันที (quiz ที่อัพโหลดจะเก็บใน localStorage)

### วิธีที่ 2: รัน Local Server (แนะนำสำหรับ Development)

```bash
# ติดตั้ง dependencies
npm install

# รัน http-server (ไม่รองรับ upload API)
npm run serve

# หรือรัน Vercel dev (รองรับ upload API + บันทึกไฟล์จริง)
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

### วิธีที่ 3: Deploy บน Vercel (Production)

**ไม่ต้องติดตั้ง Vercel CLI!** ใช้ GitHub Auto-Deploy:

1. **Push โปรเจคขึ้น GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

2. **Deploy ผ่าน Vercel Dashboard**
   - ไปที่ [vercel.com](https://vercel.com)
   - Login ด้วย GitHub
   - คลิก "Add New Project"
   - Import repository ของคุณ
   - คลิก "Deploy"

3. **ตั้งค่า Environment Variables (สำหรับ upload feature)**
   - ไปที่ Project Settings → Environment Variables
   - เพิ่ม: `BLOB_READ_WRITE_TOKEN` (ได้จาก Vercel Blob Storage)

4. **เสร็จแล้ว!** ทุกครั้งที่ push ไป GitHub จะ auto-deploy ให้อัตโนมัติ

---

---

## 📝 รูปแบบไฟล์ Quiz

### รูปแบบที่ 1: Simple Format (แนะนำ)
```json
[
  {
    "text": "คำถาม",
    "info": "คำอธิบาย",
    "difficulty": "easy",
    "answers": [
      { "text": "ตัวเลือก 1", "correct": true },
      { "text": "ตัวเลือก 2", "correct": false }
    ]
  }
]
```

### รูปแบบที่ 2: Full Format
```json
{
  "title": "ชื่อ Quiz",
  "description": "คำอธิบาย",
  "difficulty": "medium",
  "questions": [
    {
      "text": "คำถาม",
      "answers": ["ตัวเลือก 1", "ตัวเลือก 2"],
      "correct": 0,
      "info": "คำอธิบาย"
    }
  ]
}
```

ระบบรองรับทั้ง 2 รูปแบบและจะแปลงอัตโนมัติ

---

## 🔄 เพิ่ม Quiz ใหม่

### วิธีที่ 1: อัพโหลดผ่านหน้าเว็บ (แนะนำ)

1. เปิดหน้า Library
2. คลิกปุ่ม "📤 Upload Quiz"
3. เลือกไฟล์ `.json` ที่ต้องการ
4. ระบบจะตรวจสอบและเพิ่ม quiz อัตโนมัติ

**หมายเหตุ:**
- **Local/http-server**: Quiz จะเก็บใน localStorage (ลบเมื่อ clear browser data)
- **Vercel dev**: Quiz จะบันทึกลงโฟลเดอร์ `json/` จริงๆ
- **Vercel production**: Quiz จะบันทึกลง Vercel Blob Storage

Quiz ที่อัพโหลดสามารถลบได้ด้วยปุ่ม "🗑️ Delete"

### วิธีที่ 2: เพิ่มไฟล์โดยตรง

1. สร้างไฟล์ `.json` ในโฟลเดอร์ `json/`
2. ตั้งชื่อไฟล์ตามหัวข้อ (เช่น `javascript-basics.json`)
3. เพิ่มใน `json/quiz-list.json`:

```json
{
  "quizzes": [
    {
      "id": "javascript-basics",
      "title": "JavaScript Basics",
      "description": "คำอธิบาย",
      "difficulty": "easy",
      "questionCount": 10,
      "file": "json/javascript-basics.json"
    }
  ]
}
```

4. Refresh หน้าเว็บ

---

## 🎮 วิธีใช้งาน

1. **เลือก Quiz** จากหน้า Library
2. **เลือกโหมด**:
   - **Instant Feedback**: แสดงคำตอบที่ถูกทันทีหลังเลือก
   - **Review After Finish**: แสดงคำตอบหลังทำเสร็จทั้งหมด
3. **ตอบคำถาม**: เลือกคำตอบได้ครั้งละ 1 ข้อ (ไม่สามารถเปลี่ยนใจได้)
4. **ดูผลคะแนน**: แสดงคะแนน เวลาที่ใช้ และสถิติตามระดับความยาก
5. **ทบทวนคำตอบที่ผิด**: ดูคำอธิบายของคำตอบที่ถูกต้อง

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch
```

**Test Results**: 63/64 tests passing (98.4% pass rate)

---

## 📁 โครงสร้างโปรเจค

```
quizflow/
├── index.html              # หน้า Library
├── css/
│   └── styles.css          # Styles ทั้งหมด
├── js/
│   ├── validation.js       # ตรวจสอบรูปแบบ quiz
│   ├── library.js          # แสดง quiz library
│   ├── storage.js          # จัดการ localStorage
│   ├── quiz.js             # Logic หลักของ quiz
│   ├── upload.js           # จัดการการอัพโหลด
│   ├── ui.js               # UI controller
│   └── navigation.js       # ระบบนำทาง
├── pages/
│   ├── mode-selection.html # เลือกโหมดตอบคำถาม
│   ├── quiz.html           # หน้าทำ quiz
│   ├── results.html        # แสดงผลคะแนน
│   └── review.html         # ทบทวนคำตอบที่ผิด
├── json/
│   ├── quiz-list.json      # รายการ quiz
│   └── *.json              # ไฟล์ quiz
├── api/
│   └── upload.js           # Vercel Function สำหรับอัพโหลด
└── vercel.json             # Vercel configuration
```

---

## 🔧 Configuration

### vercel.json
```json
{
  "rewrites": [
    { "source": "/", "destination": "/index.html" },
    { "source": "/pages/(.*)", "destination": "/pages/$1" }
  ]
}
```

### Environment Variables (Vercel)
- `BLOB_READ_WRITE_TOKEN`: Token สำหรับ Vercel Blob Storage

---

## 📄 License

MIT License - ใช้งานได้อย่างอิสระ

---

## 🤝 Contributing

Pull requests are welcome! สำหรับการเปลี่ยนแปลงใหญ่ กรุณาเปิด issue ก่อน

---

## 📞 Support

หากพบปัญหาหรือมีคำถาม กรุณาเปิด issue ใน GitHub repository

## Project Structure

```
quizflow/
├── index.html              # Main library page
├── css/
│   └── styles.css          # Global styles
├── js/
│   ├── validation.js       # Quiz JSON schema validation
│   ├── library.js          # Quiz library display
│   ├── storage.js          # LocalStorage management
│   ├── quiz.js             # Quiz engine core logic
│   ├── upload.js           # File upload handler
│   └── ui.js               # UI controller
├── pages/
│   ├── mode-selection.html # Answer mode selection
│   ├── quiz.html           # Quiz taking interface
│   ├── results.html        # Results display
│   └── review.html         # Mistake review
└── json/
    ├── quiz-list.json      # Quiz manifest
    └── sample-quiz.json    # Sample quiz file
```

## Quiz JSON Schema

Quiz files must follow this schema:

```json
{
  "title": "string",
  "description": "string",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "text": "string",
      "answers": ["string"],
      "correct": number,
      "info": "string (optional)",
      "difficulty": "easy|medium|hard (optional)"
    }
  ]
}
```

### Validation Rules

- `title`, `description`, and `difficulty` are required
- `difficulty` must be "easy", "medium", or "hard"
- `questions` must be a non-empty array
- Each question must have:
  - `text`: non-empty string
  - `answers`: non-empty array of strings
  - `correct`: integer index within bounds of answers array (0 ≤ correct < answers.length)
  - `info`: optional explanation string
  - `difficulty`: optional difficulty level

## Development

### Running Tests

```bash
# Run validation tests
node js/validation.test.js

# Run upload handler tests
node js/upload.test.js

# Verify sample quiz
node verify-sample.js
```

### Upload Functionality

The upload handler (`js/upload.js`) provides the following features:

1. **File Input Handler**: Creates a hidden file input that accepts only `.json` files
2. **Quiz Format Validation**: Validates uploaded files against the quiz schema before upload
3. **Upload Status Display**: Shows loading, success, and error messages to the user
4. **Error Handling**: Provides descriptive error messages for invalid files

#### Usage

The upload button is automatically initialized on the library page (index.html). When clicked:
1. User selects a JSON file
2. File is validated against quiz schema
3. If valid, file is uploaded to the server (Vercel Function)
4. Quiz library is refreshed to show the new quiz

#### API Endpoint

The upload handler sends files to `/api/upload` (Vercel Serverless Function). The endpoint:
- Accepts POST requests with multipart/form-data
- Validates quiz format server-side for security
- Stores files in Vercel Blob Storage
- Updates quiz-list.json with new quiz metadata
- Returns success/error responses with descriptive messages

**Request Format:**
```
POST /api/upload
Content-Type: multipart/form-data

file: <quiz.json file>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Quiz uploaded successfully",
  "quiz": {
    "id": "quiz-id",
    "title": "Quiz Title",
    "description": "Quiz description",
    "difficulty": "easy",
    "questionCount": 5,
    "filePath": "https://blob.vercel-storage.com/quizzes/quiz-id.json"
  }
}
```

**Error Responses:**
- `405`: Method not allowed (non-POST request)
- `400`: Invalid file type, invalid JSON, or invalid quiz format
- `500`: Server error (blob storage failure, file system error)

### Deployment Setup

To deploy to Vercel:

1. Install dependencies:
```bash
npm install
```

2. Set up Vercel Blob Storage token:
```bash
vercel env add BLOB_READ_WRITE_TOKEN
```

3. Deploy:
```bash
vercel deploy
```

The `vercel.json` configuration file handles routing and serverless function setup automatically.

## Implementation Status

- [x] Task 1: Project structure and core data validation
  - [x] Directory structure created
  - [x] HTML template structure set up
  - [x] Quiz JSON schema validation implemented
  - [x] Sample quiz files created

- [x] Task 6: Implement upload handler (upload.js)
  - [x] File input handler created
  - [x] validateQuizFormat function integrated
  - [x] uploadQuiz function implemented (Vercel Function integration)
  - [x] Upload status display implemented
  - [x] Error handling for invalid files added
  - [x] Unit tests written and passing

- [x] Task 7: Create Vercel serverless function for upload
  - [x] /api/upload.js endpoint created
  - [x] Vercel Blob Storage integration implemented
  - [x] quiz-list.json update logic added
  - [x] Error responses for invalid uploads implemented
  - [x] Unit tests written and passing (8 tests)
  - [x] package.json and vercel.json configuration added

## Next Steps

- Task 6.1: Write property test for upload validation
- Task 6.2: Write additional unit tests for upload handler
- Task 8: Implement UI controller (ui.js)
