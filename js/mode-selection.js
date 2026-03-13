/**
 * Mode Selection Page Logic
 * Handles mode selection and navigation to quiz page
 */

import { saveMode } from './storage.js';

/**
 * Get quiz ID from URL parameters
 * @returns {string|null} Quiz ID or null if not found
 */
function getQuizIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('quiz');
}

/**
 * Render mode selection cards
 */
function renderModeCards() {
  const container = document.getElementById('mode-selection');
  
  if (!container) {
    console.error('Mode selection container not found');
    return;
  }

  const modes = [
    {
      id: 'instant',
      icon: '⚡',
      title: 'Instant Feedback',
      description: 'Get immediate feedback after each answer',
      features: [
        'See correct/incorrect immediately',
        'Read explanations right away',
        'Learn as you go',
        'Perfect for studying'
      ]
    },
    {
      id: 'review',
      icon: '📝',
      title: 'Review After Finish',
      description: 'Answer all questions first, then review',
      features: [
        'Focus on answering questions',
        'No distractions during quiz',
        'Review all at the end',
        'Great for testing yourself'
      ]
    }
  ];

  container.innerHTML = modes.map(mode => `
    <div class="mode-card" data-mode="${mode.id}">
      <div class="mode-card-icon">${mode.icon}</div>
      <h2 class="mode-card-title">${mode.title}</h2>
      <p class="mode-card-description">${mode.description}</p>
      <ul class="mode-card-features">
        ${mode.features.map(feature => `<li>${feature}</li>`).join('')}
      </ul>
      <button class="mode-card-button" data-mode="${mode.id}">
        Select ${mode.title}
      </button>
    </div>
  `).join('');

  // Add click handlers
  attachEventHandlers();
}

/**
 * Attach event handlers to mode cards and buttons
 */
function attachEventHandlers() {
  const modeCards = document.querySelectorAll('.mode-card');
  const modeButtons = document.querySelectorAll('.mode-card-button');

  // Handle card clicks
  modeCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if button was clicked (it has its own handler)
      if (e.target.classList.contains('mode-card-button')) {
        return;
      }
      const mode = card.dataset.mode;
      selectMode(mode);
    });
  });

  // Handle button clicks
  modeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent card click from firing
      const mode = button.dataset.mode;
      selectMode(mode);
    });
  });
}

/**
 * Handle mode selection
 * @param {string} mode - Selected mode (instant|review)
 */
function selectMode(mode) {
  const quizId = getQuizIdFromUrl();

  if (!quizId) {
    console.error('No quiz ID found in URL');
    alert('Error: No quiz selected. Please return to the library and select a quiz.');
    window.location.href = '../index.html';
    return;
  }

  if (!mode || (mode !== 'instant' && mode !== 'review')) {
    console.error('Invalid mode selected:', mode);
    return;
  }

  // Save the selected mode
  const saved = saveMode(quizId, mode);
  
  if (!saved) {
    console.warn('Mode could not be saved to localStorage, but continuing...');
  }

  // Navigate to quiz page with quiz ID and mode
  window.location.href = `quiz.html?quiz=${encodeURIComponent(quizId)}&mode=${mode}`;
}

/**
 * Initialize the mode selection page
 */
function init() {
  // Check if quiz ID is present
  const quizId = getQuizIdFromUrl();
  
  if (!quizId) {
    console.error('No quiz ID in URL, redirecting to library');
    alert('Please select a quiz from the library first.');
    window.location.href = '../index.html';
    return;
  }

  // Render mode cards
  renderModeCards();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Export functions for testing
export {
  getQuizIdFromUrl,
  renderModeCards,
  selectMode
};
