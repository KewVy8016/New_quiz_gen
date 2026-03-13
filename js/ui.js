/**
 * UI Controller
 * Handles UI rendering and updates for quiz pages
 */

/**
 * Show a question with its answers
 * @param {Object} question - Question object
 * @param {number} index - Current question index (0-based)
 * @param {number} total - Total number of questions
 * @param {number|null} selectedAnswer - Previously selected answer index (if any)
 * @returns {HTMLElement} Question element
 */
function showQuestion(question, index, total, selectedAnswer = null) {
  if (!question || typeof index !== 'number' || typeof total !== 'number') {
    console.error('Invalid parameters for showQuestion');
    return null;
  }

  // Create question container
  const questionContainer = document.createElement('div');
  questionContainer.className = 'question-container';
  questionContainer.setAttribute('data-question-index', index);

  // Create progress indicator
  const progressIndicator = document.createElement('div');
  progressIndicator.className = 'progress-indicator';
  progressIndicator.textContent = `Question ${index + 1} of ${total}`;
  questionContainer.appendChild(progressIndicator);

  // Create question text
  const questionText = document.createElement('div');
  questionText.className = 'question-text';
  questionText.textContent = question.text;
  questionContainer.appendChild(questionText);

  // Create answers container
  const answersContainer = document.createElement('div');
  answersContainer.className = 'answers-container';

  // Create answer options
  question.answers.forEach((answer, answerIndex) => {
    const answerOption = document.createElement('button');
    answerOption.className = 'answer-option';
    answerOption.setAttribute('data-answer-index', answerIndex);
    answerOption.textContent = answer;

    // Mark as selected if this was previously selected
    if (selectedAnswer === answerIndex) {
      answerOption.classList.add('selected');
    }

    answersContainer.appendChild(answerOption);
  });

  questionContainer.appendChild(answersContainer);

  return questionContainer;
}

/**
 * Show feedback for an answer (instant mode)
 * @param {boolean} isCorrect - Whether the answer is correct
 * @param {string} explanation - Explanation text (optional)
 * @param {HTMLElement} container - Container element to append feedback to
 */
function showFeedback(isCorrect, explanation, container) {
  if (!container) {
    console.error('Container element is required for showFeedback');
    return;
  }

  // Remove any existing feedback
  const existingFeedback = container.querySelector('.feedback-container');
  if (existingFeedback) {
    existingFeedback.remove();
  }

  // Create feedback container
  const feedbackContainer = document.createElement('div');
  feedbackContainer.className = 'feedback-container';
  feedbackContainer.classList.add(isCorrect ? 'feedback-correct' : 'feedback-incorrect');

  // Create feedback header
  const feedbackHeader = document.createElement('div');
  feedbackHeader.className = 'feedback-header';
  feedbackHeader.textContent = isCorrect ? '✓ Correct!' : '✗ Incorrect';
  feedbackContainer.appendChild(feedbackHeader);

  // Add explanation if available
  if (explanation && explanation.trim()) {
    const feedbackExplanation = document.createElement('div');
    feedbackExplanation.className = 'feedback-explanation';
    feedbackExplanation.textContent = explanation;
    feedbackContainer.appendChild(feedbackExplanation);
  }

  container.appendChild(feedbackContainer);
}

/**
 * Show quiz results
 * @param {Object} results - Results object
 * @param {number} results.score - Number of correct answers
 * @param {number} results.total - Total number of questions
 * @param {number} results.percentage - Score percentage
 * @param {number} results.timeTaken - Time taken in milliseconds
 * @param {Object} difficultyStats - Statistics by difficulty level (optional)
 * @returns {HTMLElement} Results element
 */
function showResults(results, difficultyStats = null) {
  if (!results || typeof results.score !== 'number' || typeof results.total !== 'number') {
    console.error('Invalid results object for showResults');
    return null;
  }

  // Create results container
  const resultsContainer = document.createElement('div');
  resultsContainer.className = 'results-container';

  // Create score display
  const scoreDisplay = document.createElement('div');
  scoreDisplay.className = 'results-score';
  
  const scoreValue = document.createElement('div');
  scoreValue.className = 'score-value';
  scoreValue.textContent = `${results.score}/${results.total}`;
  scoreDisplay.appendChild(scoreValue);

  const scorePercentage = document.createElement('div');
  scorePercentage.className = 'score-percentage';
  scorePercentage.textContent = `${results.percentage}%`;
  scoreDisplay.appendChild(scorePercentage);

  resultsContainer.appendChild(scoreDisplay);

  // Create time display
  if (typeof results.timeTaken === 'number') {
    const timeDisplay = document.createElement('div');
    timeDisplay.className = 'results-time';
    
    const minutes = Math.floor(results.timeTaken / 60000);
    const seconds = Math.floor((results.timeTaken % 60000) / 1000);
    
    timeDisplay.textContent = `Time: ${minutes}m ${seconds}s`;
    resultsContainer.appendChild(timeDisplay);
  }

  // Create difficulty statistics if provided
  if (difficultyStats && typeof difficultyStats === 'object') {
    const statsContainer = document.createElement('div');
    statsContainer.className = 'results-difficulty-stats';
    
    const statsTitle = document.createElement('h3');
    statsTitle.textContent = 'Performance by Difficulty';
    statsContainer.appendChild(statsTitle);

    Object.entries(difficultyStats).forEach(([difficulty, stats]) => {
      if (stats.total > 0) {
        const statItem = document.createElement('div');
        statItem.className = 'difficulty-stat-item';
        
        const statLabel = document.createElement('span');
        statLabel.className = `difficulty-label difficulty-${difficulty}`;
        statLabel.textContent = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
        
        const statValue = document.createElement('span');
        statValue.className = 'difficulty-stat-value';
        const percentage = Math.round((stats.correct / stats.total) * 100);
        statValue.textContent = `${stats.correct}/${stats.total} (${percentage}%)`;
        
        statItem.appendChild(statLabel);
        statItem.appendChild(statValue);
        statsContainer.appendChild(statItem);
      }
    });

    resultsContainer.appendChild(statsContainer);
  }

  // Create action buttons container
  const actionsContainer = document.createElement('div');
  actionsContainer.className = 'results-actions';

  // Review mistakes button (only if there are mistakes)
  if (results.score < results.total) {
    const reviewButton = document.createElement('button');
    reviewButton.className = 'results-button review-mistakes-button';
    reviewButton.textContent = 'Review Mistakes';
    reviewButton.setAttribute('data-action', 'review-mistakes');
    actionsContainer.appendChild(reviewButton);
  }

  // Retake quiz button
  const retakeButton = document.createElement('button');
  retakeButton.className = 'results-button retake-button';
  retakeButton.textContent = 'Retake Quiz';
  retakeButton.setAttribute('data-action', 'retake');
  actionsContainer.appendChild(retakeButton);

  // Return to library button
  const libraryButton = document.createElement('button');
  libraryButton.className = 'results-button library-button';
  libraryButton.textContent = 'Back to Library';
  libraryButton.setAttribute('data-action', 'library');
  actionsContainer.appendChild(libraryButton);

  resultsContainer.appendChild(actionsContainer);

  return resultsContainer;
}

/**
 * Show mistakes review
 * @param {Array} incorrectAnswers - Array of incorrect answer objects
 * @param {number} currentIndex - Current mistake index being viewed
 * @returns {HTMLElement} Mistakes review element
 */
function showMistakes(incorrectAnswers, currentIndex = 0) {
  if (!Array.isArray(incorrectAnswers)) {
    console.error('Invalid incorrectAnswers array for showMistakes');
    return null;
  }

  // Create mistakes container
  const mistakesContainer = document.createElement('div');
  mistakesContainer.className = 'mistakes-container';

  // Handle perfect score case
  if (incorrectAnswers.length === 0) {
    const congratsMessage = document.createElement('div');
    congratsMessage.className = 'congrats-message';
    congratsMessage.innerHTML = `
      <div class="congrats-icon">🎉</div>
      <h2>Perfect Score!</h2>
      <p>You answered all questions correctly. Great job!</p>
    `;
    mistakesContainer.appendChild(congratsMessage);
    
    // Add return button
    const returnButton = document.createElement('button');
    returnButton.className = 'mistakes-button library-button';
    returnButton.textContent = 'Back to Library';
    returnButton.setAttribute('data-action', 'library');
    mistakesContainer.appendChild(returnButton);
    
    return mistakesContainer;
  }

  // Validate current index
  if (currentIndex < 0 || currentIndex >= incorrectAnswers.length) {
    currentIndex = 0;
  }

  const mistake = incorrectAnswers[currentIndex];

  // Create navigation header
  const navHeader = document.createElement('div');
  navHeader.className = 'mistakes-nav-header';
  navHeader.textContent = `Mistake ${currentIndex + 1} of ${incorrectAnswers.length}`;
  mistakesContainer.appendChild(navHeader);

  // Create question display
  const questionDisplay = document.createElement('div');
  questionDisplay.className = 'mistake-question';
  questionDisplay.textContent = mistake.question;
  mistakesContainer.appendChild(questionDisplay);

  // Create answers display
  const answersDisplay = document.createElement('div');
  answersDisplay.className = 'mistake-answers';

  // Show user's answer
  const userAnswer = document.createElement('div');
  userAnswer.className = 'mistake-answer user-answer';
  userAnswer.innerHTML = `
    <span class="answer-label">Your Answer:</span>
    <span class="answer-text incorrect">${mistake.userAnswerText}</span>
  `;
  answersDisplay.appendChild(userAnswer);

  // Show correct answer
  const correctAnswer = document.createElement('div');
  correctAnswer.className = 'mistake-answer correct-answer';
  correctAnswer.innerHTML = `
    <span class="answer-label">Correct Answer:</span>
    <span class="answer-text correct">${mistake.correctAnswerText}</span>
  `;
  answersDisplay.appendChild(correctAnswer);

  mistakesContainer.appendChild(answersDisplay);

  // Show explanation if available
  if (mistake.explanation && mistake.explanation.trim()) {
    const explanation = document.createElement('div');
    explanation.className = 'mistake-explanation';
    explanation.innerHTML = `
      <div class="explanation-label">Explanation:</div>
      <div class="explanation-text">${mistake.explanation}</div>
    `;
    mistakesContainer.appendChild(explanation);
  }

  // Create navigation buttons
  const navButtons = document.createElement('div');
  navButtons.className = 'mistakes-nav-buttons';

  // Previous button
  if (currentIndex > 0) {
    const prevButton = document.createElement('button');
    prevButton.className = 'mistakes-button nav-button';
    prevButton.textContent = '← Previous';
    prevButton.setAttribute('data-action', 'prev');
    navButtons.appendChild(prevButton);
  }

  // Next button
  if (currentIndex < incorrectAnswers.length - 1) {
    const nextButton = document.createElement('button');
    nextButton.className = 'mistakes-button nav-button';
    nextButton.textContent = 'Next →';
    nextButton.setAttribute('data-action', 'next');
    navButtons.appendChild(nextButton);
  }

  // Back to results button
  const backButton = document.createElement('button');
  backButton.className = 'mistakes-button back-button';
  backButton.textContent = 'Back to Results';
  backButton.setAttribute('data-action', 'results');
  navButtons.appendChild(backButton);

  mistakesContainer.appendChild(navButtons);

  return mistakesContainer;
}

/**
 * Update progress indicator
 * @param {number} current - Current question number (1-based)
 * @param {number} total - Total number of questions
 * @param {HTMLElement} container - Container element for progress indicator
 */
function updateProgressIndicator(current, total, container) {
  if (!container || typeof current !== 'number' || typeof total !== 'number') {
    console.error('Invalid parameters for updateProgressIndicator');
    return;
  }

  container.textContent = `Question ${current} of ${total}`;
}

/**
 * Enable or disable finish button based on completion status
 * @param {boolean} allAnswered - Whether all questions have been answered
 * @param {HTMLElement} button - Finish button element
 */
function updateFinishButton(allAnswered, button) {
  if (!button) {
    console.error('Button element is required for updateFinishButton');
    return;
  }

  if (allAnswered) {
    button.disabled = false;
    button.classList.remove('disabled');
  } else {
    button.disabled = true;
    button.classList.add('disabled');
  }
}

/**
 * Show navigation warning when leaving quiz
 * @param {string} message - Warning message
 * @returns {boolean} True if user confirms navigation
 */
function showNavigationWarning(message = 'You have unanswered questions. Are you sure you want to leave?') {
  return confirm(message);
}

/**
 * Calculate difficulty statistics from results
 * @param {Array} questions - Array of question objects
 * @param {Object} answers - Map of question index to answer index
 * @returns {Object} Statistics by difficulty level
 */
function calculateDifficultyStats(questions, answers) {
  if (!Array.isArray(questions) || !answers) {
    return {};
  }

  const stats = {};

  questions.forEach((question, index) => {
    const difficulty = question.difficulty || 'medium';
    
    if (!stats[difficulty]) {
      stats[difficulty] = { correct: 0, total: 0 };
    }

    stats[difficulty].total++;

    const selectedAnswer = answers[index];
    if (typeof selectedAnswer === 'number' && selectedAnswer === question.correct) {
      stats[difficulty].correct++;
    }
  });

  return stats;
}

// Export functions for use in other modules
export {
  showQuestion,
  showFeedback,
  showResults,
  showMistakes,
  updateProgressIndicator,
  updateFinishButton,
  showNavigationWarning,
  calculateDifficultyStats
};
