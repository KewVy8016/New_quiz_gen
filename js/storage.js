/**
 * Storage Manager
 * Handles localStorage operations for quiz progress and results
 */

// Storage key prefixes
const PROGRESS_PREFIX = 'quiz_state_';
const RESULTS_PREFIX = 'quiz_results_';
const MODE_PREFIX = 'quiz_mode_';

// Check if localStorage is available
let storageAvailable = true;
let memoryStorage = {}; // Fallback in-memory storage

/**
 * Check if localStorage is available and working
 * @returns {boolean} True if localStorage is available
 */
function checkStorageAvailability() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    console.warn('localStorage is not available:', e);
    return false;
  }
}

// Initialize storage availability check
storageAvailable = checkStorageAvailability();

/**
 * Get item from storage (localStorage or memory fallback)
 * @param {string} key - Storage key
 * @returns {string|null} Stored value or null
 */
function getItem(key) {
  if (storageAvailable) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      storageAvailable = false;
      return memoryStorage[key] || null;
    }
  }
  return memoryStorage[key] || null;
}

/**
 * Set item in storage (localStorage or memory fallback)
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @returns {boolean} True if successful
 */
function setItem(key, value) {
  if (storageAvailable) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      // Handle quota exceeded or other errors
      if (e.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded:', e);
        showStorageWarning('Storage quota exceeded. Consider clearing old quiz data.');
      } else {
        console.error('Error writing to localStorage:', e);
      }
      storageAvailable = false;
      memoryStorage[key] = value;
      return false;
    }
  }
  memoryStorage[key] = value;
  return false;
}

/**
 * Remove item from storage
 * @param {string} key - Storage key
 */
function removeItem(key) {
  if (storageAvailable) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing from localStorage:', e);
    }
  }
  delete memoryStorage[key];
}

/**
 * Show storage warning to user
 * @param {string} message - Warning message
 */
function showStorageWarning(message) {
  // This function can be enhanced with UI integration
  console.warn('Storage Warning:', message);
  // Could dispatch a custom event for UI to handle
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('storageWarning', { detail: { message } }));
  }
}

/**
 * Save quiz progress to storage
 * @param {string} quizId - Quiz identifier
 * @param {Object} state - Progress state object
 * @param {string} state.quizId - Quiz ID
 * @param {string} state.mode - Answer mode (instant|review)
 * @param {number} state.currentQuestion - Current question index
 * @param {Object} state.answers - Map of question index to answer index
 * @param {number} state.startTime - Quiz start timestamp
 * @param {boolean} state.completed - Whether quiz is completed
 * @returns {boolean} True if save was successful
 */
function saveProgress(quizId, state) {
  if (!quizId || !state) {
    console.error('Invalid parameters for saveProgress');
    return false;
  }

  try {
    const key = PROGRESS_PREFIX + quizId;
    const data = JSON.stringify(state);
    const success = setItem(key, data);
    
    if (!success && !storageAvailable) {
      showStorageWarning('Progress saved in memory only. Data will be lost on page refresh.');
    }
    
    return true;
  } catch (e) {
    console.error('Error saving progress:', e);
    return false;
  }
}

/**
 * Load quiz progress from storage
 * @param {string} quizId - Quiz identifier
 * @returns {Object|null} Progress state object or null if not found
 */
function loadProgress(quizId) {
  if (!quizId) {
    console.error('Invalid quizId for loadProgress');
    return null;
  }

  try {
    const key = PROGRESS_PREFIX + quizId;
    const data = getItem(key);
    
    if (!data) {
      return null;
    }

    const state = JSON.parse(data);
    
    // Validate loaded data structure
    if (!state.quizId || !state.answers || typeof state.currentQuestion !== 'number') {
      console.warn('Corrupted progress data detected, clearing...');
      removeItem(key);
      return null;
    }
    
    return state;
  } catch (e) {
    console.error('Error loading progress:', e);
    // Clear corrupted data
    const key = PROGRESS_PREFIX + quizId;
    removeItem(key);
    return null;
  }
}

/**
 * Save quiz results to storage
 * @param {string} quizId - Quiz identifier
 * @param {Object} results - Results object
 * @param {string} results.quizId - Quiz ID
 * @param {number} results.score - Number of correct answers
 * @param {number} results.total - Total number of questions
 * @param {number} results.percentage - Score percentage
 * @param {number} results.timeTaken - Time taken in milliseconds
 * @param {number} results.completedAt - Completion timestamp
 * @param {Array} results.incorrectAnswers - Array of incorrect answer details
 * @returns {boolean} True if save was successful
 */
function saveResults(quizId, results) {
  if (!quizId || !results) {
    console.error('Invalid parameters for saveResults');
    return false;
  }

  try {
    const key = RESULTS_PREFIX + quizId;
    const data = JSON.stringify(results);
    const success = setItem(key, data);
    
    if (!success && !storageAvailable) {
      showStorageWarning('Results saved in memory only. Data will be lost on page refresh.');
    }
    
    return true;
  } catch (e) {
    console.error('Error saving results:', e);
    return false;
  }
}

/**
 * Load quiz results from storage
 * @param {string} quizId - Quiz identifier
 * @returns {Object|null} Results object or null if not found
 */
function loadResults(quizId) {
  if (!quizId) {
    console.error('Invalid quizId for loadResults');
    return null;
  }

  try {
    const key = RESULTS_PREFIX + quizId;
    const data = getItem(key);
    
    if (!data) {
      return null;
    }

    const results = JSON.parse(data);
    
    // Validate loaded data structure
    if (!results.quizId || typeof results.score !== 'number' || typeof results.total !== 'number') {
      console.warn('Corrupted results data detected, clearing...');
      removeItem(key);
      return null;
    }
    
    return results;
  } catch (e) {
    console.error('Error loading results:', e);
    // Clear corrupted data
    const key = RESULTS_PREFIX + quizId;
    removeItem(key);
    return null;
  }
}

/**
 * Clear quiz progress from storage
 * @param {string} quizId - Quiz identifier
 */
function clearProgress(quizId) {
  if (!quizId) {
    console.error('Invalid quizId for clearProgress');
    return;
  }

  const key = PROGRESS_PREFIX + quizId;
  removeItem(key);
}

/**
 * Clear quiz results from storage
 * @param {string} quizId - Quiz identifier
 */
function clearResults(quizId) {
  if (!quizId) {
    console.error('Invalid quizId for clearResults');
    return;
  }

  const key = RESULTS_PREFIX + quizId;
  removeItem(key);
}

/**
 * Save answer mode for a quiz
 * @param {string} quizId - Quiz identifier
 * @param {string} mode - Answer mode (instant|review)
 * @returns {boolean} True if save was successful
 */
function saveMode(quizId, mode) {
  if (!quizId || !mode) {
    console.error('Invalid parameters for saveMode');
    return false;
  }

  try {
    const key = MODE_PREFIX + quizId;
    return setItem(key, mode);
  } catch (e) {
    console.error('Error saving mode:', e);
    return false;
  }
}

/**
 * Load answer mode for a quiz
 * @param {string} quizId - Quiz identifier
 * @returns {string|null} Answer mode or null if not found
 */
function loadMode(quizId) {
  if (!quizId) {
    console.error('Invalid quizId for loadMode');
    return null;
  }

  try {
    const key = MODE_PREFIX + quizId;
    return getItem(key);
  } catch (e) {
    console.error('Error loading mode:', e);
    return null;
  }
}

/**
 * Check if storage is currently available
 * @returns {boolean} True if localStorage is available
 */
function isStorageAvailable() {
  return storageAvailable;
}

// Show warning if localStorage is not available on load
if (!storageAvailable) {
  showStorageWarning('localStorage is not available. Progress will only be saved in memory and lost on page refresh.');
}

// Export functions for use in other modules
export {
  saveProgress,
  loadProgress,
  saveResults,
  loadResults,
  clearProgress,
  clearResults,
  saveMode,
  loadMode,
  isStorageAvailable
};
