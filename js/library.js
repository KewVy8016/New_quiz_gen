/**
 * Library Manager
 * Handles quiz library display and quiz selection
 */

import { loadResults, loadProgress } from './storage.js';

/**
 * Fetch the list of available quizzes from the server
 * @returns {Promise<Array>} Array of quiz metadata objects
 * @throws {Error} If quiz list cannot be fetched
 */
async function fetchQuizList() {
  try {
    let quizzes = [];
    
    // Try to fetch from local json/quiz-list.json first
    try {
      let response = await fetch('/json/quiz-list.json');
      
      // If absolute path fails (file:// protocol), try relative path
      if (!response.ok && window.location.protocol === 'file:') {
        response = await fetch('./json/quiz-list.json');
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Handle both array format and object format
        if (Array.isArray(data)) {
          quizzes = data;
        } else if (data.quizzes && Array.isArray(data.quizzes)) {
          quizzes = data.quizzes;
        }
      }
    } catch (error) {
      console.log('Local quiz-list not found, trying Blob Storage...');
    }
    
    // If no local quizzes found, try Blob Storage (for Vercel deployment)
    if (quizzes.length === 0) {
      try {
        // Try to fetch from Vercel Blob Storage
        const blobResponse = await fetch('https://blob.vercel-storage.com/quiz-list.json');
        if (blobResponse.ok) {
          const data = await blobResponse.json();
          if (Array.isArray(data)) {
            quizzes = data;
          } else if (data.quizzes && Array.isArray(data.quizzes)) {
            quizzes = data.quizzes;
          }
        }
      } catch (error) {
        console.log('Blob Storage quiz-list not found');
      }
    }
    
    // Add uploaded quizzes from localStorage
    const uploadedQuizzes = JSON.parse(localStorage.getItem('uploadedQuizzes') || '{}');
    const uploadedQuizList = Object.values(uploadedQuizzes).map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      questionCount: quiz.questionCount,
      uploaded: true
    }));
    
    // Combine both lists
    return [...quizzes, ...uploadedQuizList];
    
  } catch (error) {
    console.error('Error fetching quiz list:', error);
    
    // If fetch fails, return only uploaded quizzes
    const uploadedQuizzes = JSON.parse(localStorage.getItem('uploadedQuizzes') || '{}');
    return Object.values(uploadedQuizzes).map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description,
      difficulty: quiz.difficulty,
      questionCount: quiz.questionCount,
      uploaded: true
    }));
  }
}

/**
 * Calculate progress for a quiz based on stored data
 * @param {string} quizId - Quiz identifier
 * @returns {Object} Progress information with percentage, score, and completion status
 */
function calculateProgress(quizId) {
  if (!quizId) {
    return {
      percentage: 0,
      score: null,
      completed: false
    };
  }

  // Check if quiz is completed (has results)
  const results = loadResults(quizId);
  if (results) {
    return {
      percentage: 100,
      score: results.score,
      total: results.total,
      completed: true
    };
  }

  // Check if quiz has in-progress data
  const progress = loadProgress(quizId);
  if (progress && progress.answers) {
    const answeredCount = Object.keys(progress.answers).length;
    const totalQuestions = progress.totalQuestions || 0;
    
    if (totalQuestions > 0) {
      const percentage = Math.round((answeredCount / totalQuestions) * 100);
      return {
        percentage,
        score: null,
        completed: false
      };
    }
  }

  // No progress found
  return {
    percentage: 0,
    score: null,
    completed: false
  };
}

/**
 * Render a quiz card element
 * @param {Object} quiz - Quiz metadata object
 * @param {string} quiz.id - Quiz identifier
 * @param {string} quiz.title - Quiz title
 * @param {string} quiz.description - Quiz description
 * @param {string} quiz.difficulty - Difficulty level (easy|medium|hard)
 * @param {number} quiz.questionCount - Total number of questions
 * @param {Object} progress - Progress information from calculateProgress
 * @returns {HTMLElement} Quiz card DOM element
 */
function renderQuizCard(quiz, progress) {
  if (!quiz || !quiz.id || !quiz.title) {
    console.error('Invalid quiz data for rendering');
    return null;
  }

  // Create card container
  const card = document.createElement('div');
  card.className = 'quiz-card';
  card.dataset.quizId = quiz.id;

  // Create title
  const title = document.createElement('h3');
  title.className = 'quiz-card-title';
  title.textContent = quiz.title;

  // Create description
  const description = document.createElement('p');
  description.className = 'quiz-card-description';
  description.textContent = quiz.description || '';

  // Create metadata container
  const metadata = document.createElement('div');
  metadata.className = 'quiz-card-metadata';

  // Add difficulty badge
  const difficulty = document.createElement('span');
  difficulty.className = `quiz-card-difficulty difficulty-${quiz.difficulty || 'medium'}`;
  difficulty.textContent = (quiz.difficulty || 'medium').toUpperCase();

  // Add question count
  const questionCount = document.createElement('span');
  questionCount.className = 'quiz-card-question-count';
  questionCount.textContent = `${quiz.questionCount || 0} Questions`;

  metadata.appendChild(difficulty);
  metadata.appendChild(questionCount);

  // Create progress/score section
  const progressSection = document.createElement('div');
  progressSection.className = 'quiz-card-progress';

  if (progress && progress.completed && progress.score !== null) {
    // Show final score for completed quizzes
    const scoreDisplay = document.createElement('div');
    scoreDisplay.className = 'quiz-card-score';
    scoreDisplay.textContent = `Score: ${progress.score}/${progress.total} (${Math.round((progress.score / progress.total) * 100)}%)`;
    progressSection.appendChild(scoreDisplay);
  } else if (progress && progress.percentage > 0) {
    // Show progress bar for in-progress quizzes
    const progressBar = document.createElement('div');
    progressBar.className = 'quiz-card-progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'quiz-card-progress-fill';
    progressFill.style.width = `${progress.percentage}%`;
    
    const progressText = document.createElement('span');
    progressText.className = 'quiz-card-progress-text';
    progressText.textContent = `${progress.percentage}% Complete`;
    
    progressBar.appendChild(progressFill);
    progressSection.appendChild(progressBar);
    progressSection.appendChild(progressText);
  } else {
    // Show "Not Started" for new quizzes
    const notStarted = document.createElement('div');
    notStarted.className = 'quiz-card-not-started';
    notStarted.textContent = 'Not Started';
    progressSection.appendChild(notStarted);
  }

  // Create action button
  const button = document.createElement('button');
  button.className = 'quiz-card-button';
  
  if (progress && progress.completed) {
    button.textContent = 'Retake Quiz';
  } else if (progress && progress.percentage > 0) {
    button.textContent = 'Continue Quiz';
  } else {
    button.textContent = 'Start Quiz';
  }

  // Add click handler to navigate to mode selection or quiz page
  button.addEventListener('click', () => {
    // Navigate to mode selection page with quiz ID
    window.location.href = `/pages/mode-selection.html?quiz=${quiz.id}`;
  });

  // Assemble the card
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(metadata);
  card.appendChild(progressSection);
  card.appendChild(button);
  
  // Add delete button for uploaded quizzes
  if (quiz.uploaded) {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'quiz-card-delete';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.title = 'Delete this uploaded quiz';
    
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm(`Delete "${quiz.title}"?`)) {
        const uploadedQuizzes = JSON.parse(localStorage.getItem('uploadedQuizzes') || '{}');
        delete uploadedQuizzes[quiz.id];
        localStorage.setItem('uploadedQuizzes', JSON.stringify(uploadedQuizzes));
        window.location.reload();
      }
    });
    
    card.appendChild(deleteBtn);
  }

  return card;
}

// Export functions for use in other modules
export {
  fetchQuizList,
  renderQuizCard,
  calculateProgress
};
