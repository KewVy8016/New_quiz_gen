/**
 * Quiz Engine
 * Core quiz logic for loading, answering, and scoring
 */

// Current quiz state
let currentQuiz = null;
let currentAnswers = {};

/**
 * Load quiz data from JSON file or Blob Storage
 * @param {string} quizId - Quiz identifier (filename without .json)
 * @returns {Promise<Object>} Quiz data object
 * @throws {Error} If quiz cannot be loaded
 */
async function loadQuiz(quizId) {
  if (!quizId) {
    throw new Error('Quiz ID is required');
  }

  try {
    // First, check if quiz is in localStorage (uploaded quiz)
    const uploadedQuizzes = JSON.parse(localStorage.getItem('uploadedQuizzes') || '{}');
    if (uploadedQuizzes[quizId]) {
      console.log('✓ Loading quiz from localStorage:', quizId);
      currentQuiz = uploadedQuizzes[quizId].data;
      currentAnswers = {};
      return currentQuiz;
    }
    
    console.log('Quiz not in localStorage, checking API...');
    
    // Try to get quiz metadata from API (includes Blob Storage URLs)
    try {
      const listResponse = await fetch('/api/quiz-list');
      if (listResponse.ok) {
        const listData = await listResponse.json();
        console.log('✓ Got quiz list from API:', listData);
        
        if (listData.success && Array.isArray(listData.quizzes)) {
          const quizMeta = listData.quizzes.find(q => q.id === quizId);
          
          if (quizMeta) {
            console.log('✓ Found quiz metadata:', quizMeta);
            
            if (quizMeta.filePath) {
              // Quiz is in Blob Storage, load from URL
              console.log('→ Loading quiz from Blob Storage:', quizMeta.filePath);
              const blobResponse = await fetch(quizMeta.filePath);
              
              if (blobResponse.ok) {
                const quizData = await blobResponse.json();
                
                // Validate quiz data structure
                if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
                  throw new Error('Invalid quiz data structure');
                }
                
                console.log('✓ Quiz loaded successfully from Blob Storage');
                currentQuiz = quizData;
                currentAnswers = {};
                return quizData;
              } else {
                console.error('Failed to load from Blob Storage:', blobResponse.status);
              }
            } else if (quizMeta.file) {
              // Quiz has local file path
              console.log('→ Quiz has local file path:', quizMeta.file);
            }
          } else {
            console.warn('Quiz not found in quiz list:', quizId);
          }
        }
      } else {
        console.log('API returned error:', listResponse.status);
      }
    } catch (apiError) {
      console.log('⚠️ API not available, trying local file:', apiError.message);
    }
    
    // Fallback: try to load from local JSON file
    console.log('→ Trying to load from local file: /json/' + quizId + '.json');
    let response = await fetch(`/json/${quizId}.json`);
    
    // If absolute path fails (file:// protocol), try relative path
    if (!response.ok && window.location.protocol === 'file:') {
      console.log('→ Trying relative path...');
      response = await fetch(`../json/${quizId}.json`);
    }
    
    if (!response.ok) {
      throw new Error(`Failed to load quiz: ${response.status} ${response.statusText}`);
    }

    const quizData = await response.json();
    
    // Validate quiz data structure
    if (!quizData.title || !quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz data structure');
    }

    console.log('✓ Quiz loaded successfully from local file');
    currentQuiz = quizData;
    currentAnswers = {};
    
    return quizData;
  } catch (error) {
    console.error('❌ Error loading quiz:', error);
    throw error;
  }
}

/**
 * Select an answer for a question
 * @param {number} questionIndex - Index of the question
 * @param {number} answerIndex - Index of the selected answer
 * @returns {boolean} True if answer was recorded successfully
 */
function selectAnswer(questionIndex, answerIndex) {
  if (typeof questionIndex !== 'number' || questionIndex < 0) {
    console.error('Invalid question index');
    return false;
  }

  if (typeof answerIndex !== 'number' || answerIndex < 0) {
    console.error('Invalid answer index');
    return false;
  }

  // Validate against current quiz
  if (currentQuiz && currentQuiz.questions) {
    if (questionIndex >= currentQuiz.questions.length) {
      console.error('Question index out of bounds');
      return false;
    }

    const question = currentQuiz.questions[questionIndex];
    if (answerIndex >= question.answers.length) {
      console.error('Answer index out of bounds');
      return false;
    }
  }

  currentAnswers[questionIndex] = answerIndex;
  return true;
}

/**
 * Evaluate if an answer is correct
 * @param {Object} question - Question object
 * @param {number} selectedIndex - Index of the selected answer
 * @returns {Object} Evaluation result with isCorrect and explanation
 */
function evaluateAnswer(question, selectedIndex) {
  if (!question || typeof question.correct !== 'number') {
    return {
      isCorrect: false,
      explanation: 'Invalid question data'
    };
  }

  if (typeof selectedIndex !== 'number') {
    return {
      isCorrect: false,
      explanation: 'No answer selected'
    };
  }

  const isCorrect = selectedIndex === question.correct;
  
  return {
    isCorrect,
    explanation: question.info || ''
  };
}

/**
 * Calculate the total score based on answers
 * @param {Object} answers - Map of question index to answer index
 * @param {Array} questions - Array of question objects
 * @returns {Object} Score object with correct count, total, and percentage
 */
function calculateScore(answers, questions) {
  if (!questions || !Array.isArray(questions)) {
    return {
      score: 0,
      total: 0,
      percentage: 0
    };
  }

  let correctCount = 0;
  const total = questions.length;

  questions.forEach((question, index) => {
    const selectedAnswer = answers[index];
    
    if (typeof selectedAnswer === 'number' && selectedAnswer === question.correct) {
      correctCount++;
    }
  });

  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

  return {
    score: correctCount,
    total,
    percentage
  };
}

/**
 * Get list of incorrectly answered questions
 * @param {Object} answers - Map of question index to answer index
 * @param {Array} questions - Array of question objects
 * @returns {Array} Array of incorrect answer details
 */
function getIncorrectAnswers(answers, questions) {
  if (!questions || !Array.isArray(questions)) {
    return [];
  }

  const incorrectAnswers = [];

  questions.forEach((question, index) => {
    const selectedAnswer = answers[index];
    
    // Check if answer exists and is incorrect
    if (typeof selectedAnswer === 'number' && selectedAnswer !== question.correct) {
      incorrectAnswers.push({
        questionIndex: index,
        question: question.text,
        selectedAnswer,
        correctAnswer: question.correct,
        explanation: question.info || '',
        userAnswerText: question.answers[selectedAnswer] || '',
        correctAnswerText: question.answers[question.correct] || ''
      });
    }
  });

  return incorrectAnswers;
}

/**
 * Get current quiz data
 * @returns {Object|null} Current quiz object or null
 */
function getCurrentQuiz() {
  return currentQuiz;
}

/**
 * Get current answers
 * @returns {Object} Current answers map
 */
function getCurrentAnswers() {
  return { ...currentAnswers };
}

/**
 * Set current answers (for restoring progress)
 * @param {Object} answers - Answers map to restore
 */
function setCurrentAnswers(answers) {
  if (answers && typeof answers === 'object') {
    currentAnswers = { ...answers };
  }
}

/**
 * Reset quiz state
 */
function resetQuiz() {
  currentQuiz = null;
  currentAnswers = {};
}

// Export functions for use in other modules
export {
  loadQuiz,
  selectAnswer,
  evaluateAnswer,
  calculateScore,
  getIncorrectAnswers,
  getCurrentQuiz,
  getCurrentAnswers,
  setCurrentAnswers,
  resetQuiz
};
