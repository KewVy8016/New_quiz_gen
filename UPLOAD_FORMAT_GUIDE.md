# 📝 QuizFlow - รูปแบบไฟล์ Quiz

## รูปแบบที่รองรับ

QuizFlow รองรับ **2 รูปแบบ**:

### 1. รูปแบบง่าย (Simple Format) - แนะนำ ✨

เป็น **array of questions โดยตรง** ไม่ต้องมี wrapper object

```json
[
  {
    "text": "คำถาม",
    "info": "คำอธิบายหลังตอบ",
    "difficulty": "easy",
    "answers": [
      {
        "text": "ตัวเลือก 1",
        "correct": false
      },
      {
        "text": "ตัวเลือก 2",
        "correct": true
      },
      {
        "text": "ตัวเลือก 3",
        "correct": false
      }
    ]
  },
  {
    "text": "คำถามที่ 2",
    "info": "คำอธิบาย",
    "difficulty": "medium",
    "answers": [
      {
        "text": "ตัวเลือก A",
        "correct": true
      },
      {
        "text": "ตัวเลือก B",
        "correct": false
      }
    ]
  }
]
```

### 2. รูปแบบเต็ม (Full Format)

มี metadata ครบถ้วน (title, description, difficulty)

```json
{
  "title": "ชื่อ Quiz",
  "description": "คำอธิบาย Quiz",
  "difficulty": "medium",
  "questions": [
    {
      "text": "คำถาม",
      "info": "คำอธิบาย",
      "difficulty": "easy",
      "answers": [
        {
          "text": "ตัวเลือก 1",
          "correct": false
        },
        {
          "text": "ตัวเลือก 2",
          "correct": true
        }
      ]
    }
  ]
}
```

## 🔄 การแปลงอัตโนมัติ

ระบบจะแปลงรูปแบบใหม่ให้เป็นรูปแบบภายในโดยอัตโนมัติ:

**รูปแบบใหม่:**
```json
{
  "answers": [
    {"text": "A", "correct": false},
    {"text": "B", "correct": true}
  ]
}
```

**แปลงเป็น (ภายใน):**
```json
{
  "answers": ["A", "B"],
  "correct": 1
}
```

## 📋 ฟิลด์ที่ต้องมี

### Question Object
- `text` (string, required) - ข้อความคำถาม
- `answers` (array, required) - รายการตัวเลือก
- `info` (string, optional) - คำอธิบายหลังตอบ
- `difficulty` (string, optional) - ระดับความยาก: "easy", "medium", "hard"

### Answer Object (รูปแบบใหม่)
- `text` (string, required) - ข้อความตัวเลือก
- `correct` (boolean, required) - ถูกหรือผิด (ต้องมี 1 ข้อที่เป็น true)

## 🎯 ตัวอย่างการใช้งาน

### ตัวอย่างที่ 1: Quiz ง่ายๆ
```json
[
  {
    "text": "2 + 2 = ?",
    "difficulty": "easy",
    "answers": [
      {"text": "3", "correct": false},
      {"text": "4", "correct": true},
      {"text": "5", "correct": false}
    ],
    "info": "2 + 2 = 4"
  }
]
```

### ตัวอย่างที่ 2: Quiz หลายคำถาม
```json
[
  {
    "text": "What is JavaScript?",
    "difficulty": "easy",
    "answers": [
      {"text": "A programming language", "correct": true},
      {"text": "A coffee brand", "correct": false}
    ],
    "info": "JavaScript is a programming language for web development."
  },
  {
    "text": "What does HTML stand for?",
    "difficulty": "medium",
    "answers": [
      {"text": "Hyper Text Markup Language", "correct": true},
      {"text": "High Tech Modern Language", "correct": false},
      {"text": "Home Tool Markup Language", "correct": false}
    ],
    "info": "HTML stands for Hyper Text Markup Language."
  }
]
```

## 📤 วิธีอัพโหลด

1. สร้างไฟล์ `.json` ตามรูปแบบข้างต้น
2. คลิกปุ่ม "Upload New Quiz" บนหน้าเว็บ
3. เลือกไฟล์ที่สร้าง
4. ระบบจะตรวจสอบและแปลงรูปแบบอัตโนมัติ
5. Quiz จะปรากฏในหน้า Library ทันที

## ⚠️ ข้อควรระวัง

- ต้องมีคำตอบที่ถูกต้อง (`correct: true`) **เพียง 1 ข้อ** ต่อคำถาม
- ฟิลด์ `difficulty` ต้องเป็น: "easy", "medium", หรือ "hard" เท่านั้น
- ไฟล์ต้องเป็น JSON ที่ valid (ใช้ JSON validator ตรวจสอบก่อนอัพโหลด)
- ตัวเลือกต้องมีอย่างน้อย 2 ข้อ

## 🔍 การตรวจสอบ

ใช้เครื่องมือเหล่านี้ตรวจสอบไฟล์ก่อนอัพโหลด:
- [JSONLint](https://jsonlint.com/) - ตรวจสอบ JSON syntax
- [JSON Formatter](https://jsonformatter.org/) - จัดรูปแบบ JSON

## 💡 Tips

1. **ใช้รูปแบบง่าย** ถ้าไม่ต้องการ metadata เพิ่มเติม
2. **ตั้งชื่อไฟล์ให้ชัดเจน** เช่น `operating-systems.json`, `javascript-basics.json`
3. **เขียน info ที่ดี** เพื่อช่วยผู้เรียนเข้าใจเมื่อตอบผิด
4. **จัดระดับความยาก** ให้เหมาะสมกับเนื้อหา

## 📁 ตัวอย่างไฟล์

ดูตัวอย่างไฟล์ที่:
- `json/sample-quiz.json` - รูปแบบเต็ม (Full Format)
- `json/sample-quiz-new-format.json` - รูปแบบง่าย (Simple Format)
