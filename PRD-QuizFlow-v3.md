# PRD v3 — JSON Quiz Learning Platform

---

## 🧩 Product Overview

| Field | Detail |
|---|---|
| **Product Name** | QuizFlow |
| **Product Type** | Static Quiz Learning Platform |
| **Deploy Target** | Vercel (ไม่ต้องมี backend) |
| **Version** | 3.1 |
| **Updated** | 2026 |

**เว็บสำหรับทำข้อสอบจากไฟล์ JSON** โดยไฟล์ข้อสอบเก็บอยู่บน server และผู้ใช้สามารถอัปโหลดเพิ่มได้จากหน้าหลัก รองรับระบบเฉลยทันทีและเฉลยหลังทำเสร็จ พร้อมดูข้อที่ผิดและคำนวณคะแนน โดย progress การทำข้อสอบเก็บใน localStorage เพื่อไม่ให้หายเมื่อ refresh

### User Journey

```
เปิดเว็บ → เลือก Quiz จาก Library → เลือกโหมดเฉลย → ทำข้อสอบ → ดูผลลัพธ์ + ข้อที่ผิด → กลับมาทำต่อได้
```

---

## 🎯 Product Vision

สร้างเว็บสำหรับ **Self-learning · Exam Preparation · Knowledge Review**

ที่มี UX: **Simple · Fast · Focus Learning**

แนวเดียวกับ Quizizz · LeetCode Learning Mode · Quizgecko Study Mode

---

## 🗂️ Core Concept

ระบบใช้ **JSON files** เป็น Quiz database โดยแต่ละไฟล์ = 1 quiz topic

**แยก storage ออกเป็น 2 ส่วนที่ทำหน้าที่ต่างกัน:**

| ข้อมูล | เก็บที่ไหน | เหตุผล |
|---|---|---|
| ไฟล์ JSON (quiz content) | **Server** (Vercel static files) | ทุกคนเข้าถึงได้ ไม่หายเมื่อล้าง browser |
| Progress / คำตอบ | **LocalStorage** | กัน refresh หาย ไม่ต้องการ backend |

```
/json
 ├── Memory Management.json
 ├── CPU Scheduling.json
 └── Networking.json
```

---

## 📐 Data Structure

### โครงสร้างคำถาม

```json
{
  "text": "question",
  "info": "explanation",
  "difficulty": "easy | medium | hard",
  "answers": [
    {
      "text": "choice",
      "correct": true
    }
  ]
}
```

### Field Reference

| Field | Description |
|---|---|
| `text` | คำถาม |
| `answers` | ตัวเลือก |
| `correct` | คำตอบที่ถูก |
| `info` | คำอธิบาย (แสดงหลังตอบ หรือหลังทำเสร็จ ขึ้นอยู่กับโหมด) |
| `difficulty` | ระดับความยาก |

---

## 📥 File Upload System

### การเพิ่ม Quiz จากหน้าหลัก

ผู้ใช้สามารถอัปโหลดไฟล์ JSON ได้จากหน้า Library โดยตรง ไฟล์จะถูกส่งขึ้น **server** ผ่าน Vercel Serverless Function เพื่อให้ทุกคนเข้าถึง quiz ใหม่ได้เหมือนกัน

#### Upload Flow

```
ผู้ใช้คลิก [+ Add Quiz]
  ↓
เลือกไฟล์ .json จากเครื่อง
  ↓
Frontend อ่านไฟล์ด้วย FileReader API
  ↓
Validate JSON schema (client-side)
  ↓
POST ไปยัง /api/upload (Vercel Function)
  ↓
Server บันทึกไฟล์ผ่าน Vercel Blob Storage
  ↓
อัปเดต quiz-list.json
  ↓
Library reload → quiz ใหม่ปรากฏให้ทุกคนเห็น
```

### Validation Rules ก่อน Upload

| Check | Rule |
|---|---|
| Format | Must be valid JSON array |
| Required fields | `text`, `answers` |
| Answers | ต้องมีอย่างน้อย 2 ตัวเลือก |
| Correct | ต้องมี `correct: true` อย่างน้อย 1 ข้อต่อ question |

### Add Quiz Modal

```
┌─────────────────────────────────────────┐
│  Add New Quiz                      [✕]  │
│                                         │
│  Upload JSON File:                      │
│  [📄 Choose File]  No file chosen       │
│                                         │
│  ─── or paste JSON ───                  │
│                                         │
│  Quiz Name:                             │
│  [______________________________]       │
│                                         │
│  [                                  ]   │
│  [      JSON textarea               ]   │
│  [                                  ]   │
│                                         │
│  ⚠️ Validation status shown here        │
│                                         │
│  [Cancel]              [Upload Quiz]    │
└─────────────────────────────────────────┘
```

---

## 📚 Quiz Library System

ระบบ fetch `quiz-list.json` จาก server → generate topic cards → display quiz library

```json
[
  "Memory Management.json",
  "CPU Scheduling.json",
  "Networking.json"
]
```

ทุก quiz ที่อยู่ใน list นี้ถูกเก็บบน server ผู้ใช้แค่ fetch มาเมื่อเลือกทำ

---

## 🏷️ Topic Generation

ชื่อหัวข้อ quiz มาจาก **file name**

| Input | Output |
|---|---|
| `Memory Management.json` | Memory Management |
| `CPU_Scheduling.json` | CPU Scheduling |

**ขั้นตอน:**
1. Remove `.json`
2. Replace `_` → space

---

## 🔄 User Flow

### Home
```
open website → fetch quiz-list.json (server) → render library → select quiz หรือ [+ Add Quiz]
```

### Mode Selection
```
select quiz → choose answer mode:
  ├── Instant Feedback (เฉลยทันทีหลังตอบ)
  └── Review After (เฉลยหลังทำเสร็จทุกข้อ)
```

### Quiz
```
fetch quiz JSON จาก server
  ↓
check localStorage → resume หรือเริ่มใหม่
  ↓
render questions → user selects answer
  ↓
save answer → localStorage (ทันที ทุกครั้งที่ตอบ)
  ↓
  [Instant Feedback] → show explanation immediately → next
  [Review After]     → mark answer → next (ไม่แสดงเฉลย)
```

### Result
```
calculate score → show summary → show wrong answers → retry quiz
```

---

## 🎮 Answer Modes

### Mode 1 — Instant Feedback

เฉลยทันทีหลังผู้ใช้ตอบแต่ละข้อ

- highlight ตัวเลือกที่ถูก / ผิด
- แสดง `info` (explanation) ทันที
- ปุ่ม **Next** เพื่อไปข้อถัดไป
- ไม่สามารถเปลี่ยนคำตอบได้หลังเลือก

### Mode 2 — Review After Finish

ทำทุกข้อก่อน แล้วค่อยดูเฉลยรวม

- ผู้ใช้ตอบทุกข้อโดยไม่เห็นเฉลยระหว่างทาง
- เมื่อ submit ทั้งหมด → ไปหน้า Result
- หน้า Result แสดงคะแนน + รายการข้อที่ผิดพร้อมเฉลย
- สามารถย้อนดูทุกข้อพร้อม explanation ได้

### Mode Selection UI

```
┌──────────────────────────────────────────┐
│  Choose your learning mode               │
│                                          │
│  ○ Instant Feedback                      │
│    ได้รับ explanation ทันทีหลังตอบ       │
│                                          │
│  ○ Review After Finish                   │
│    ทำครบแล้วค่อยดูเฉลยรวม               │
│                                          │
│              [ Start Quiz ]              │
└──────────────────────────────────────────┘
```

---

## 🏆 Score System

```
score = correct / total × 100
```

**ตัวอย่าง:** Score: 12 / 15 → **80%**

### Score Display

```
┌──────────────────────────────┐
│     Quiz Complete! 🎉        │
│                              │
│        80%                   │
│     12 / 15 Correct          │
│                              │
│  ✅ Correct:    12           │
│  ❌ Incorrect:   3           │
│                              │
│  [Review Mistakes] [Retry]   │
└──────────────────────────────┘
```

---

## ❌ Wrong Answer Review

หน้า **Review Mistakes** แสดงเฉพาะข้อที่ตอบผิด

### รูปแบบแสดงผล

```
Question 3 of 15                       ❌ Incorrect

What is the primary function of the CPU cache?

  ○ A. Store permanent data
  ● B. Speed up memory access          ← your answer (wrong)
  ○ C. Manage I/O operations
  ✓ D. Reduce CPU-RAM speed gap        ← correct answer

💡 Explanation:
   Cache memory reduces the speed gap between CPU and RAM by
   storing frequently used data closer to the processor.
```

### Features

- แสดงทุกข้อที่ผิด แบบ paginated
- highlight คำตอบที่ผู้ใช้เลือก (สีแดง) vs คำตอบที่ถูก (สีเขียว)
- แสดง `info` ของทุกข้อที่ผิด
- ปุ่ม Prev / Next เพื่อดูแต่ละข้อ

---

## ✅ Answer Evaluation UI

### Instant Feedback Mode

```
✔ Correct
Explanation: Main memory and registers are the only storage areas
the CPU can access directly.
```

```
✘ Incorrect — Correct answer: [D]
Explanation: Cache memory stores frequently accessed data to
reduce average memory access time.
```

---

## 💾 State Persistence

### แยกหน้าที่ชัดเจน

```
Server (Vercel)               LocalStorage (Browser)
──────────────────────        ──────────────────────
quiz JSON files         ←→    progress / answers
quiz-list.json                mode ที่เลือก
                              current question index
```

- **Quiz content** → fetch จาก server ทุกครั้ง ไม่เก็บใน localStorage
- **Progress/คำตอบ** → เก็บใน localStorage ทันทีทุกครั้งที่ตอบ เพื่อ resume ได้หลัง refresh

### LocalStorage Keys

| Key | Content |
|---|---|
| `quiz_state_<quiz_name>` | progress state (คำตอบ + ข้อปัจจุบัน + mode) |
| `quiz_mode_<quiz_name>` | answer mode ที่เลือกไว้ |

### State Schema

```json
{
  "currentQuestion": 4,
  "mode": "instant | review",
  "answers": {
    "0": 2,
    "1": 1,
    "2": 0
  }
}
```

---

## ▶️ Resume Quiz

```
เปิด quiz
  ↓
fetch quiz JSON จาก server
  ↓
check localStorage สำหรับ quiz_state_<n>
  ├── มี state → resume จากข้อที่ค้างไว้ + mode เดิม
  └── ไม่มี state → ไปหน้า Mode Selection → เริ่มใหม่
```

---

## 🔁 Reset Progress

ปุ่ม **Reset Progress** จะ:
- clear `quiz_state_<quiz_name>`
- clear `quiz_mode_<quiz_name>`
- กลับไปหน้า Mode Selection

quiz content บน server ไม่ได้รับผลกระทบ

---

## 🖥️ UI Pages

### Home Page (Library)
- Quiz Library (ดึงจาก server)
- Topic Cards พร้อม progress indicator (อ่านจาก localStorage)
- ปุ่ม **+ Add Quiz**

```
Memory Management
Progress: 6 / 20 · 30%
▓▓▓░░░░░░░░░░░░░░░░░░

CPU Scheduling
Progress: 0 / 30 · Not started
```

### Mode Selection Page
- ชื่อ Quiz + จำนวนข้อ
- 2 โหมดให้เลือก พร้อมคำอธิบาย
- ปุ่ม Start Quiz

### Quiz Page
- Question number (x / total)
- Difficulty badge (Easy / Medium / Hard)
- Question text
- Choices (A B C D)
- Progress bar
- Explanation panel (Instant Feedback mode เท่านั้น)
- Next / Previous

### Result Page
- Score (% และ fraction)
- Correct / Incorrect count
- ปุ่ม **Review Mistakes** (ถ้ามีข้อผิด)
- ปุ่ม **Retry**
- ปุ่ม **Back to Library**

### Review Mistakes Page
- ข้อที่ผิดทีละข้อ
- แสดง answer highlight
- Explanation
- Pagination (1 / N)

---

## 📖 Quiz Library Card

```
Memory Management
20 questions · Medium avg difficulty
Progress: 8 / 20 · 40%
▓▓▓▓▓▓▓▓░░░░░░░░░░░░
[Continue Quiz]
```

| Info | Detail |
|---|---|
| Topic | ชื่อหัวข้อ (จาก filename บน server) |
| Question count | จำนวนข้อ |
| Progress | อ่านจาก localStorage |
| Action | Continue / Start |

---

## ✨ Optional Features (Future)

| Feature | Description |
|---|---|
| **Shuffle Questions** | random question order |
| **Shuffle Answers** | random choice order |
| **Difficulty Filter** | easy / medium / hard |
| **Search Quiz** | search topics |
| **Export Results** | download score summary เป็น PDF |
| **Bookmark Questions** | mark ข้อที่ต้องการทบทวน |

---

## ⚡ Performance Requirements

- Load < **1 second**
- Support **1,000+ questions**
- รองรับ modern browsers (Chrome, Firefox, Safari, Edge)

---

## 🏗️ Architecture

```
Browser
  ↓
GET /quiz-list.json  ← server
  ↓
Render quiz library
  (progress badge อ่านจาก localStorage)
  ↓
[+ Add Quiz] → validate JSON → POST /api/upload → Vercel Blob Storage
  ↓
User selects quiz
  ↓
GET /json/<quiz>.json  ← server
  ↓
check localStorage → resume หรือ Mode Selection
  ↓
Render questions
  ↓
Save answers → LocalStorage (ทุกครั้งที่ตอบ)
  ↓
Result Page → Review Mistakes
```

---

## 📁 Project Structure

```
quizflow/
│
├── index.html          ← Library + Add Quiz modal
├── mode.html           ← Mode selection
├── quiz.html           ← Quiz page
├── result.html         ← Result + score
├── review.html         ← Wrong answer review
│
├── quiz.js             ← Quiz logic + answer evaluation
├── library.js          ← Library rendering
├── upload.js           ← File upload to server
├── storage.js          ← LocalStorage (progress only)
├── style.css
│
├── quiz-list.json      ← Quiz manifest (on server)
│
├── api/
│   └── upload.js       ← Vercel Serverless Function
│
└── json/
    ├── memory-management.json
    ├── cpu-scheduling.json
    └── networking.json
```

---

## ⚠️ Constraints

| ข้อจำกัด | รายละเอียด |
|---|---|
| Quiz content | เก็บบน server เท่านั้น ไม่ขึ้นกับ browser ของผู้ใช้ |
| Progress | เก็บใน localStorage — หายหากผู้ใช้ล้าง browser data |
| Upload | ต้องการ Vercel Blob Storage สำหรับ persistent file write |
| Browser | รองรับ modern browsers เท่านั้น |
