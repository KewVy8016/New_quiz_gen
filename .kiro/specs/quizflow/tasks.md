# Implementation Plan: QuizFlow

## Overview

This implementation plan breaks down the QuizFlow static quiz platform into incremental coding tasks. Each task builds on previous work, starting with core data structures and validation, then building up the UI components, and finally integrating everything together. The plan includes both implementation and testing tasks to ensure correctness at each step.

## Tasks

- [x] 1. Set up project structure and core data validation
  - Create directory structure (js/, css/, pages/, json/)
  - Set up HTML template structure
  - Implement quiz JSON schema validation
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 1.1 Write property tests for quiz validation
  - **Property 4: Quiz Format Validation**
  - **Property 6: Answer Index Bounds Validation**
  - **Validates: Requirements 2.1, 8.1, 8.2, 8.3, 8.4**

- [ ]* 1.2 Write property test for quiz serialization
  - **Property 7: Quiz Serialization Round-Trip**
  - **Validates: Requirements 8.6**

- [x] 2. Implement storage manager (storage.js)
  - Create localStorage wrapper functions
  - Implement saveProgress, loadProgress functions
  - Implement saveResults, loadResults functions
  - Add error handling for storage failures
  - _Requirements: 5.1, 5.2, 5.3, 5.5_


- [ ]* 2.1 Write property tests for storage persistence
  - **Property 8: Mode Storage Persistence**
  - **Property 12: Answer Selection Persistence**
  - **Property 16: Progress State Round-Trip**
  - **Property 17: Results Persistence**
  - **Validates: Requirements 3.4, 4.2, 5.1, 5.2, 5.3**

- [ ]* 2.2 Write unit tests for storage error handling
  - Test localStorage unavailable scenario
  - Test quota exceeded scenario
  - Test corrupted data recovery
  - _Requirements: 5.5_

- [x] 3. Implement quiz engine core (quiz.js)
  - Create loadQuiz function to fetch quiz JSON
  - Implement selectAnswer function
  - Implement evaluateAnswer function
  - Implement calculateScore function
  - Implement getIncorrectAnswers function
  - _Requirements: 4.2, 6.1, 7.1_

- [ ]* 3.1 Write property test for score calculation
  - **Property 18: Score Calculation Accuracy**
  - **Validates: Requirements 6.1**

- [ ]* 3.2 Write property test for mistake filtering
  - **Property 20: Mistake Filtering Accuracy**
  - **Validates: Requirements 7.1**

- [ ]* 3.3 Write unit tests for quiz engine
  - Test loadQuiz with valid and invalid quiz IDs
  - Test edge cases (empty quiz, single question)
  - _Requirements: 4.2, 6.1_

- [x] 4. Checkpoint - Ensure core logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Implement library manager (library.js)
  - Create fetchQuizList function
  - Implement renderQuizCard function
  - Implement calculateProgress function
  - Integrate with storage to show progress/scores
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ]* 5.1 Write property tests for library display
  - **Property 1: Quiz Card Display Completeness**
  - **Property 2: Progress Percentage Accuracy**
  - **Property 3: Score Display for Completed Quizzes**
  - **Validates: Requirements 1.2, 1.3, 1.4**

- [ ]* 5.2 Write unit tests for library manager
  - Test fetchQuizList error handling
  - Test empty quiz list scenario
  - _Requirements: 1.1_

- [x] 6. Implement upload handler (upload.js)
  - Create file input handler
  - Implement validateQuizFormat function
  - Create uploadQuiz function (Vercel Function integration)
  - Implement upload status display
  - Add error handling for invalid files
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 6.1 Write property test for upload validation
  - **Property 5: Invalid Quiz Rejection**
  - **Validates: Requirements 2.3**

- [ ]* 6.2 Write unit tests for upload handler
  - Test file type validation
  - Test network error handling
  - Test successful upload flow
  - _Requirements: 2.2, 2.3, 2.4_

- [x] 7. Create Vercel serverless function for upload
  - Create /api/upload.js endpoint
  - Implement Vercel Blob Storage integration
  - Add quiz-list.json update logic
  - Add error responses for invalid uploads
  - _Requirements: 2.2, 2.5_

- [x] 8. Implement UI controller (ui.js)
  - Create showQuestion function
  - Implement showFeedback function
  - Implement showResults function
  - Implement showMistakes function
  - Add navigation helpers
  - _Requirements: 4.1, 4.3, 4.4, 6.2, 6.3, 6.4, 7.2, 7.3_

- [ ]* 8.1 Write property tests for UI display
  - **Property 11: Question Display Completeness**
  - **Property 14: Progress Indicator Accuracy**
  - **Property 19: Results Display Completeness**
  - **Property 21: Mistake Display Completeness**
  - **Validates: Requirements 4.1, 4.6, 6.2, 6.3, 6.4, 7.2, 7.3**

- [x] 9. Build library page (index.html)
  - Create HTML structure for quiz library
  - Add CSS styling for quiz cards
  - Wire up library.js to render quizzes
  - Add upload button and modal
  - Wire up upload.js
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1_

- [x] 10. Build mode selection page (mode-selection.html)
  - Create HTML structure for mode selection
  - Add CSS styling for mode cards
  - Implement mode selection logic
  - Store selected mode in session/state
  - Navigate to quiz page with mode parameter
  - _Requirements: 3.1, 3.4, 3.5_

- [ ]* 10.1 Write unit test for mode selection
  - Test mode storage and retrieval
  - Test navigation with mode parameter
  - _Requirements: 3.4, 3.5_

- [x] 11. Build quiz page (quiz.html)
  - Create HTML structure for quiz interface
  - Add CSS styling for questions and answers
  - Implement question navigation (prev/next)
  - Add progress indicator
  - Implement answer selection with visual feedback
  - Wire up quiz.js and storage.js
  - _Requirements: 4.1, 4.2, 4.5, 4.6, 4.7_

- [x] 12. Implement answer mode logic in quiz page
  - Add instant feedback mode behavior
  - Add review-after-finish mode behavior
  - Show/hide feedback based on mode
  - Enable finish button when all answered
  - _Requirements: 3.2, 3.3, 4.3, 4.4, 4.7_

- [ ]* 12.1 Write property tests for answer modes
  - **Property 9: Instant Feedback Display**
  - **Property 10: Review Mode Feedback Suppression**
  - **Property 13: Navigation Answer Preservation**
  - **Property 15: Finish Button Enablement**
  - **Validates: Requirements 3.2, 3.3, 4.3, 4.4, 4.5, 4.7**

- [x] 13. Checkpoint - Ensure quiz flow works end-to-end
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Build results page (results.html)
  - Create HTML structure for results display
  - Add CSS styling for score and statistics
  - Display score as fraction and percentage
  - Show time taken
  - Show accuracy by difficulty level
  - Add buttons for review mistakes and retake
  - Wire up quiz.js to calculate and display results
  - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ]* 14.1 Write unit tests for results page
  - Test results display with various scores
  - Test edge cases (perfect score, zero score)
  - _Requirements: 6.2, 6.3, 6.4_

- [x] 15. Build review mistakes page (review.html)
  - Create HTML structure for mistake review
  - Add CSS styling for incorrect answers
  - Display only incorrect answers
  - Show question, user answer, correct answer, explanation
  - Add navigation between mistakes
  - Handle perfect score case (congratulatory message)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ]* 15.1 Write unit tests for mistake review
  - Test filtering of incorrect answers
  - Test perfect score scenario
  - Test navigation between mistakes
  - _Requirements: 7.1, 7.4, 7.5_

- [x] 16. Implement navigation system
  - Add navigation bar to all pages
  - Implement return to library functionality
  - Add warning for leaving in-progress quiz
  - Handle browser back/forward buttons
  - Implement direct quiz URL handling
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ]* 16.1 Write property tests for navigation
  - **Property 22: Navigation Warning for In-Progress Quiz**
  - **Property 23: Quiz URL Handling**
  - **Validates: Requirements 9.2, 9.5**

- [x] 17. Implement responsive design
  - Add mobile-friendly CSS media queries
  - Ensure touch targets are 44x44px minimum
  - Test layout on mobile viewport (<768px)
  - Add orientation change handling
  - Optimize font sizes for readability
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ]* 17.1 Write property test for touch targets
  - **Property 24: Touch Target Minimum Size**
  - **Validates: Requirements 10.2**

- [ ]* 17.2 Write unit tests for responsive design
  - Test mobile breakpoint behavior
  - Test orientation change handling
  - _Requirements: 10.1, 10.5_

- [x] 18. Create sample quiz JSON files
  - Create quiz-list.json manifest
  - Create 2-3 sample quiz JSON files
  - Place in /json directory
  - Ensure all follow the validated schema
  - _Requirements: 1.1, 8.1, 8.2_

- [x] 19. Set up Vercel deployment configuration
  - Create vercel.json configuration
  - Configure static file serving
  - Configure serverless function routes
  - Set up Vercel Blob Storage
  - _Requirements: 2.5_

- [x] 20. Final integration and testing
  - Test complete user flow from library to results
  - Test upload and new quiz availability
  - Test progress persistence across page refreshes
  - Test both answer modes end-to-end
  - Verify all error handling works
  - _Requirements: All_

- [x] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties using fast-check
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation throughout development
- The implementation follows a bottom-up approach: core logic → UI components → integration

