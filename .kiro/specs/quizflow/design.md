# Design Document - QuizFlow

## Overview

QuizFlow เป็นเว็บแอปพลิเคชันสำหรับทำข้อสอบจากไฟล์ JSON ที่เก็บบน server (Vercel static files) โดยมีสองโหมดการเฉลย:
- **Instant Feedback Mode**: แสดงเฉลยทันทีหลังตอบแต่ละข้อ
- **Review After Mode**: ทำทุกข้อก่อน แล้วค่อยดูเฉลยรวม

ระบบใช้ localStorage เพื่อเก็บ progress ของผู้ใช้ เพื่อให้สามารถ resume ได้หลัง refresh

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              UI Pages (HTML/CSS)                     │  │
│  │  - Library Page                                      │  │
│  │  - Mode Selection Page                               │  │
│  │  - Quiz Page                                         │  │
│  │  - Result Page                                       │  │
│  │  - Review Mistakes Page                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           JavaScript Logic Layer                     │  │
│  │  - quiz.js (Quiz logic, answer evaluation)           │  │
│  │  - library.js (Library rendering)                    │  │
│  │  - upload.js (File upload)                           │  │
│  │  - storage.js (LocalStorage management)              │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↕                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           LocalStorage (Progress Only)               │  │
│  │  - quiz_state_<quiz_name>                            │  │
│  │  - quiz_mode_<quiz_name>                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                  Server (Vercel)                            │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Static Files & API Functions                 │  │
│  │  - /json/*.json (Quiz content)                       │  │
│  │  - /quiz-list.json (Quiz manifest)                   │  │
│  │  - /api/upload.js (Serverless function)              │  │
│  │  - /api/blob-storage (Vercel Blob Storage)           │  │
│  └─────────────────────────────────────────────────────
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Library Page Load**: Fetch quiz-list.json → Render quiz cards → Load progress from localStorage
2. **Quiz Start**: Select quiz → Choose mode → Load quiz JSON → Initialize quiz state
3. **Answer Submission**: User selects answer → Save to localStorage → Show feedback (if instant mode) → Move to next question
4. **Quiz Completion**: All answered → Calculate score → Save results → Navigate to results page
5. **Review Mistakes**: Load incorrect answers → Display with explanations

## Components and Interfaces

### 1. Library Manager (`library.js`)

**Responsibilities:**
- Fetch and display quiz list
- Show progress indicators
- Handle quiz selection

**Key Functions:**
```javascript
async function fetchQuizList()
function renderQuizCard(quiz, progress)
function calculateProgress(quizId)
```

### 2. Quiz Engine (`quiz.js`)

**Responsibilities:**
- Load quiz data
- Manage quiz state
- Evaluate answers
- Calculate scores

**Key Functions:**
```javascript
async function loadQuiz(quizId)
function selectAnswer(questionIndex, answerIndex)
function evaluateAnswer(question, selectedIndex)
function calculateScore(answers, questions)
function getIncorrectAnswers()
```

### 3. Storage Manager (`storage.js`)

**Responsibilities:**
- Save/load progress to/from localStorage
- Manage quiz state persistence
- Handle storage errors

**Key Functions:**
```javascript
function saveProgress(quizId, state)
function loadProgress(quizId)
function saveResults(quizId, results)
function loadResults(quizId)
function clearProgress(quizId)
```

### 4. Upload Handler (`upload.js`)

**Responsibilities:**
- Validate quiz JSON format
- Upload to Vercel Blob Storage
- Update quiz list

**Key Functions:**
```javascript
function validateQuizFormat(jsonData)
async function uploadQuiz(file)
function showUploadStatus(status, message)
```

### 5. UI Controller (`ui.js`)

**Responsibilities:**
- Handle page navigation
- Update UI based on state
- Show feedback messages

**Key Functions:**
```javascript
function showQuestion(question, index, total)
function showFeedback(isCorrect, explanation)
function showResults(score, total, time)
function showMistakes(incorrectAnswers)
```

## Data Models

### Quiz Metadata
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "difficulty": "easy|medium|hard",
  "questionCount": "number",
  "filePath": "string"
}
```

### Quiz Content
```json
{
  "title": "string",
  "description": "string",
  "difficulty": "easy|medium|hard",
  "questions": [
    {
      "text": "string",
      "answers": ["string"],
      "correct": "number",
      "info": "string (optional)",
      "difficulty": "easy|medium|hard"
    }
  ]
}
```

### Progress State
```json
{
  "quizId": "string",
  "mode": "instant|review",
  "currentQuestion": "number",
  "answers": {
    "0": "number",
    "1": "number"
  },
  "startTime": "timestamp",
  "completed": "boolean"
}
```

### Quiz Results
```json
{
  "quizId": "string",
  "score": "number",
  "total": "number",
  "percentage": "number",
  "timeTaken": "number",
  "completedAt": "timestamp",
  "incorrectAnswers": [
    {
      "questionIndex": "number",
      "question": "string",
      "selectedAnswer": "number",
      "correctAnswer": "number",
      "explanation": "string"
    }
  ]
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.


### Property 1: Quiz Card Display Completeness
*For any* quiz object with metadata, the rendered quiz card should contain the title, description, difficulty level, and question count.
**Validates: Requirements 1.2**

### Property 2: Progress Percentage Accuracy
*For any* quiz with partial progress, the displayed completion percentage should equal (answered questions / total questions) × 100.
**Validates: Requirements 1.3**

### Property 3: Score Display for Completed Quizzes
*For any* completed quiz, the quiz card should display the final score achieved.
**Validates: Requirements 1.4**

### Property 4: Quiz Format Validation
*For any* JSON input, the validation function should correctly identify whether it conforms to the quiz schema (has required metadata fields and valid question structure).
**Validates: Requirements 2.1, 8.1, 8.2, 8.3**

### Property 5: Invalid Quiz Rejection
*For any* invalid quiz file format, the upload system should reject it and display a descriptive error message.
**Validates: Requirements 2.3**

### Property 6: Answer Index Bounds Validation
*For any* quiz file, the parser should validate that each question's correct answer index is within the bounds of its answers array (0 ≤ correct < answers.length).
**Validates: Requirements 8.4**

### Property 7: Quiz Serialization Round-Trip
*For any* valid quiz object, serializing to JSON then parsing back should produce an equivalent object.
**Validates: Requirements 8.6**

### Property 8: Mode Storage Persistence
*For any* selected answer mode (instant or review), storing it then retrieving it should return the same mode value.
**Validates: Requirements 3.4**

### Property 9: Instant Feedback Display
*For any* question answered in instant feedback mode, the system should immediately display whether the answer is correct and show the explanation (if available).
**Validates: Requirements 3.2, 4.3**

### Property 10: Review Mode Feedback Suppression
*For any* question answered in review-after-finish mode, the system should not display feedback until all questions are answered.
**Validates: Requirements 3.3, 4.4**

### Property 11: Question Display Completeness
*For any* question, the quiz interface should display the question text and all answer options from the answers array.
**Validates: Requirements 4.1**

### Property 12: Answer Selection Persistence
*For any* answer selection, saving it to progress data then retrieving it should return the same answer index.
**Validates: Requirements 4.2, 5.1**

### Property 13: Navigation Answer Preservation
*For any* sequence of answer selections, navigating between questions should preserve all previously selected answers without data loss.
**Validates: Requirements 4.5**

### Property 14: Progress Indicator Accuracy
*For any* quiz state, the progress indicator should display the current question number and total question count correctly.
**Validates: Requirements 4.6**

### Property 15: Finish Button Enablement
*For any* quiz state where all questions have selected answers, the "Finish Quiz" button should be enabled.
**Validates: Requirements 4.7**

### Property 16: Progress State Round-Trip
*For any* incomplete quiz with progress data, saving the state then loading it should restore all selected answers and the current question index.
**Validates: Requirements 5.2**

### Property 17: Results Persistence
*For any* completed quiz, saving the results (score, time, incorrect answers) then loading them should return equivalent data.
**Validates: Requirements 5.3**

### Property 18: Score Calculation Accuracy
*For any* set of questions and user answers, the calculated score should equal the count of answers where the selected index matches the correct index.
**Validates: Requirements 6.1**

### Property 19: Results Display Completeness
*For any* quiz completion, the results display should show the score as both a fraction (correct/total) and percentage, the time taken, and accuracy per difficulty level.
**Validates: Requirements 6.2, 6.3, 6.4**

### Property 20: Mistake Filtering Accuracy
*For any* quiz results, the mistake review should display only questions where the selected answer index does not equal the correct answer index.
**Validates: Requirements 7.1**

### Property 21: Mistake Display Completeness
*For any* incorrect answer in mistake review, the display should show the question text, the user's selected answer, the correct answer, and the explanation (if available).
**Validates: Requirements 7.2, 7.3**

### Property 22: Navigation Warning for In-Progress Quiz
*For any* quiz with unanswered questions, attempting to navigate away should trigger a confirmation warning.
**Validates: Requirements 9.2**

### Property 23: Quiz URL Handling
*For any* quiz ID in a direct URL access, the system should load the quiz if it exists in the quiz list, or redirect to the library if it doesn't.
**Validates: Requirements 9.5**

### Property 24: Touch Target Minimum Size
*For any* interactive UI element (buttons, answer options), the touch target should be at least 44×44 pixels to ensure mobile usability.
**Validates: Requirements 10.2**

## Error Handling

### Client-Side Errors

1. **Network Failures**
   - Quiz list fetch fails → Display error message with retry button
   - Quiz content fetch fails → Display error message, allow return to library
   - Upload fails → Display error message, allow retry

2. **Storage Errors**
   - localStorage unavailable → Display warning, continue in memory-only mode
   - localStorage quota exceeded → Display warning, offer to clear old progress
   - Corrupted progress data → Clear corrupted data, start fresh

3. **Validation Errors**
   - Invalid quiz JSON → Display specific validation errors (missing fields, invalid structure)
   - Invalid answer index → Reject quiz, show error message
   - Missing required fields → Show which fields are missing

4. **User Input Errors**
   - No answer selected → Disable next/finish buttons until answer selected
   - Invalid file type → Show error message, only accept .json files

### Error Recovery Strategies

1. **Graceful Degradation**
   - If localStorage fails, continue with in-memory state
   - If progress can't be loaded, start quiz from beginning
   - If quiz list fails, show cached version (if available)

2. **User Feedback**
   - All errors display user-friendly messages
   - Network errors show retry options
   - Validation errors show specific issues

3. **Data Integrity**
   - Validate all data before saving
   - Check data integrity when loading
   - Clear corrupted data automatically

## Testing Strategy

### Dual Testing Approach

This project will use both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit tests**: Verify specific examples, edge cases, and error conditions
- **Property tests**: Verify universal properties across all inputs

Both approaches are complementary and necessary. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing

We will use **fast-check** (JavaScript property-based testing library) to implement the correctness properties defined above.

**Configuration:**
- Minimum 100 iterations per property test (due to randomization)
- Each test tagged with: `Feature: quizflow, Property {number}: {property_text}`
- Each correctness property implemented as a SINGLE property-based test

**Example Property Test:**
```javascript
// Feature: quizflow, Property 7: Quiz Serialization Round-Trip
fc.assert(
  fc.property(
    quizGenerator(), // Custom generator for valid quiz objects
    (quiz) => {
      const json = JSON.stringify(quiz);
      const parsed = JSON.parse(json);
      return deepEqual(quiz, parsed);
    }
  ),
  { numRuns: 100 }
);
```

### Unit Testing

Unit tests will focus on:
- Specific examples demonstrating correct behavior
- Edge cases (empty quiz, single question, no explanations)
- Error conditions (network failures, invalid data, storage errors)
- Integration points (page navigation, mode switching)

**Testing Framework:** Jest or Vitest for JavaScript unit testing

### Test Coverage Areas

1. **Quiz Validation** (Properties 4, 5, 6, 7)
   - Property tests: Generate random valid/invalid quiz structures
   - Unit tests: Specific invalid formats, edge cases

2. **Progress Persistence** (Properties 8, 12, 16, 17)
   - Property tests: Generate random quiz states and verify round-trips
   - Unit tests: localStorage unavailable, quota exceeded

3. **Answer Modes** (Properties 9, 10)
   - Property tests: Generate random questions in each mode
   - Unit tests: Mode switching, specific feedback scenarios

4. **Score Calculation** (Properties 18, 19)
   - Property tests: Generate random answer sets
   - Unit tests: Edge cases (all correct, all wrong, empty)

5. **UI Display** (Properties 1, 2, 3, 11, 14, 19, 21, 24)
   - Property tests: Generate random data and verify display completeness
   - Unit tests: Specific rendering scenarios, responsive breakpoints

6. **Navigation and State** (Properties 13, 15, 22, 23)
   - Property tests: Generate random navigation sequences
   - Unit tests: Specific navigation flows, URL handling

### Test Execution

- Run property tests with minimum 100 iterations each
- Run all tests before deployment
- Include tests in CI/CD pipeline
- Monitor test execution time (property tests may be slower)

