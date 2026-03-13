# Requirements Document - QuizFlow

## Introduction

QuizFlow is a static quiz learning platform that allows users to take quizzes from JSON files, track their progress, and review their mistakes. The system operates entirely on the client-side with static file hosting on Vercel, using localStorage for progress persistence and Vercel Blob Storage for user-uploaded quiz files.

## Glossary

- **Quiz_Library**: The collection of all available quizzes displayed on the home page
- **Quiz_File**: A JSON file containing quiz metadata and questions
- **Question**: A single quiz item with text, multiple choice answers, correct answer index, and optional explanation
- **Answer_Mode**: The feedback timing preference (Instant or Review After Finish)
- **Progress_Data**: User's quiz completion state stored in localStorage
- **Quiz_Session**: A single attempt at completing a quiz
- **Result_Summary**: The final score and statistics after completing a quiz
- **Mistake_Review**: A view showing only incorrectly answered questions with explanations

## Requirements

### Requirement 1: Quiz Library Display

**User Story:** As a learner, I want to see all available quizzes with their progress, so that I can choose which quiz to take.

#### Acceptance Criteria

1. WHEN the home page loads, THE Quiz_Library SHALL fetch and display all available quizzes from the server
2. WHEN displaying each quiz, THE Quiz_Library SHALL show the quiz title, description, difficulty level, and total question count
3. WHEN a user has started a quiz, THE Quiz_Library SHALL display the completion percentage for that quiz
4. WHEN a user has completed a quiz, THE Quiz_Library SHALL display the final score achieved
5. THE Quiz_Library SHALL load quiz metadata from static JSON files hosted on Vercel

### Requirement 2: File Upload System

**User Story:** As a content creator, I want to upload new quiz JSON files, so that I can add quizzes to the platform.

#### Acceptance Criteria

1. WHEN a user selects a JSON file for upload, THE Upload_System SHALL validate the file format against the quiz schema
2. WHEN a valid quiz file is uploaded, THE Upload_System SHALL store it in Vercel Blob Storage
3. WHEN an invalid quiz file is uploaded, THE Upload_System SHALL display a descriptive error message
4. WHEN a file upload succeeds, THE Upload_System SHALL refresh the quiz library to include the new quiz
5. THE Upload_System SHALL process uploads through a Vercel serverless function

### Requirement 3: Answer Mode Selection

**User Story:** As a learner, I want to choose between instant feedback and review-after-finish modes, so that I can learn in my preferred style.

#### Acceptance Criteria

1. WHEN a user starts a quiz, THE Mode_Selection_Page SHALL display two answer mode options
2. WHEN instant feedback mode is selected, THE Quiz_Session SHALL show correct/incorrect feedback immediately after each answer
3. WHEN review-after-finish mode is selected, THE Quiz_Session SHALL hide all feedback until all questions are answered
4. THE Mode_Selection_Page SHALL store the selected mode for the current quiz session
5. WHEN a mode is selected, THE System SHALL navigate to the quiz page with the chosen mode active

### Requirement 4: Quiz Taking Experience

**User Story:** As a learner, I want to answer quiz questions and see my progress, so that I can test my knowledge.

#### Acceptance Criteria

1. WHEN a quiz page loads, THE Quiz_Interface SHALL display one question at a time with its multiple choice answers
2. WHEN a user selects an answer, THE Quiz_Interface SHALL record the selection in Progress_Data
3. WHEN instant feedback mode is active AND an answer is selected, THE Quiz_Interface SHALL immediately show whether the answer is correct and display the explanation
4. WHEN review-after-finish mode is active AND an answer is selected, THE Quiz_Interface SHALL only record the answer without showing feedback
5. WHEN a user navigates between questions, THE Quiz_Interface SHALL preserve all previously selected answers
6. THE Quiz_Interface SHALL display a progress indicator showing current question number and total questions
7. WHEN all questions are answered, THE Quiz_Interface SHALL enable a "Finish Quiz" button

### Requirement 5: Progress Persistence

**User Story:** As a learner, I want my quiz progress to be saved automatically, so that I can resume later without losing my work.

#### Acceptance Criteria

1. WHEN a user selects an answer, THE Progress_System SHALL immediately save the answer to localStorage
2. WHEN a user returns to an incomplete quiz, THE Progress_System SHALL restore all previously selected answers
3. WHEN a user completes a quiz, THE Progress_System SHALL save the final score and completion status
4. THE Progress_System SHALL store progress data using the quiz ID as the key
5. WHEN localStorage is unavailable, THE Progress_System SHALL display a warning message and continue in memory-only mode

### Requirement 6: Score Calculation and Results

**User Story:** As a learner, I want to see my quiz results with detailed statistics, so that I can understand my performance.

#### Acceptance Criteria

1. WHEN a quiz is completed, THE Score_System SHALL calculate the total number of correct answers
2. WHEN displaying results, THE Result_Summary SHALL show the score as both a fraction and a percentage
3. WHEN displaying results, THE Result_Summary SHALL show the total time taken to complete the quiz
4. WHEN displaying results, THE Result_Summary SHALL categorize questions by difficulty level with accuracy per category
5. THE Result_Summary SHALL provide options to review mistakes or retake the quiz

### Requirement 7: Wrong Answer Review

**User Story:** As a learner, I want to review only the questions I answered incorrectly with explanations, so that I can learn from my mistakes.

#### Acceptance Criteria

1. WHEN a user accesses mistake review, THE Mistake_Review SHALL display only questions that were answered incorrectly
2. WHEN displaying each wrong answer, THE Mistake_Review SHALL show the question text, the user's selected answer, and the correct answer
3. WHEN an explanation is available, THE Mistake_Review SHALL display it for each incorrect question
4. THE Mistake_Review SHALL allow navigation between incorrect questions
5. WHEN there are no incorrect answers, THE Mistake_Review SHALL display a congratulatory message

### Requirement 8: Quiz Data Format

**User Story:** As a developer, I want a standardized quiz JSON format, so that quiz content is consistent and parseable.

#### Acceptance Criteria

1. THE Quiz_File SHALL contain a metadata section with title, description, difficulty, and question count
2. THE Quiz_File SHALL contain an array of questions, each with text, answers array, correct answer index, optional explanation, and difficulty level
3. WHEN parsing a Quiz_File, THE Parser SHALL validate that all required fields are present
4. WHEN parsing a Quiz_File, THE Parser SHALL validate that the correct answer index is within the bounds of the answers array
5. THE Pretty_Printer SHALL format Quiz_File objects back into valid JSON
6. FOR ALL valid Quiz_File objects, parsing then printing then parsing SHALL produce an equivalent object (round-trip property)

### Requirement 9: Navigation and User Flow

**User Story:** As a learner, I want intuitive navigation between pages, so that I can easily move through the quiz experience.

#### Acceptance Criteria

1. WHEN on any page, THE Navigation_System SHALL provide a way to return to the quiz library
2. WHEN a quiz is in progress, THE Navigation_System SHALL warn the user before leaving the quiz page
3. WHEN navigating back to the library from a completed quiz, THE Navigation_System SHALL update the displayed progress
4. THE Navigation_System SHALL use browser history for back/forward navigation
5. WHEN a user directly accesses a quiz URL, THE Navigation_System SHALL load the quiz if it exists or redirect to the library if it doesn't

### Requirement 10: Responsive Design

**User Story:** As a learner, I want the platform to work well on mobile and desktop devices, so that I can learn anywhere.

#### Acceptance Criteria

1. WHEN the viewport width is less than 768px, THE UI SHALL adapt to a mobile-friendly layout
2. WHEN displaying on mobile, THE UI SHALL ensure touch targets are at least 44x44 pixels
3. WHEN displaying on any device, THE UI SHALL ensure text is readable without zooming
4. THE UI SHALL use responsive CSS units and media queries for layout adaptation
5. WHEN orientation changes on mobile, THE UI SHALL reflow content appropriately
