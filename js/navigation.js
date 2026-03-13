/**
 * Navigation system for QuizFlow
 * Handles navigation bar, warnings, and URL handling
 */

/**
 * Create navigation bar element
 * @param {string} currentPage - Current page identifier
 * @returns {HTMLElement} Navigation bar element
 */
export function createNavigationBar(currentPage = 'library') {
    const nav = document.createElement('nav');
    nav.className = 'nav-bar';
    
    nav.innerHTML = `
        <div class="nav-content">
            <a href="${getLibraryPath(currentPage)}" class="nav-logo">QuizFlow</a>
            <button class="nav-home-btn" onclick="window.navigateToLibrary()">
                ← Back to Library
            </button>
        </div>
    `;
    
    return nav;
}

/**
 * Get relative path to library based on current page
 * @param {string} currentPage - Current page identifier
 * @returns {string} Relative path to index.html
 */
function getLibraryPath(currentPage) {
    if (currentPage === 'library') {
        return '#';
    }
    return '../index.html';
}

/**
 * Navigate to library with optional warning
 * @param {boolean} showWarning - Whether to show warning for in-progress quiz
 * @returns {boolean} Whether navigation was allowed
 */
export function navigateToLibrary(showWarning = false) {
    if (showWarning) {
        const confirmed = confirm('You have an incomplete quiz. Your progress will be saved. Continue?');
        if (!confirmed) {
            return false;
        }
    }
    
    // Determine correct path based on current location
    const isInSubfolder = window.location.pathname.includes('/pages/');
    const libraryPath = isInSubfolder ? '../index.html' : 'index.html';
    
    window.location.href = libraryPath;
    return true;
}

/**
 * Check if quiz exists and handle direct URL access
 * @param {string} quizId - Quiz ID from URL
 * @param {Function} onSuccess - Callback if quiz exists
 * @param {Function} onError - Callback if quiz doesn't exist
 */
export async function handleDirectQuizAccess(quizId, onSuccess, onError) {
    if (!quizId) {
        if (onError) onError('No quiz ID provided');
        return;
    }
    
    try {
        // Try both absolute and relative paths for compatibility
        let response = await fetch('/json/quiz-list.json');
        
        // If absolute path fails (file:// protocol), try relative path
        if (!response.ok && window.location.protocol === 'file:') {
            response = await fetch('../json/quiz-list.json');
        }
        
        if (!response.ok) {
            throw new Error('Failed to fetch quiz list');
        }
        
        const data = await response.json();
        const quizzes = Array.isArray(data) ? data : (data.quizzes || []);
        const quizExists = quizzes.some(q => q.id === quizId);
        
        if (quizExists) {
            if (onSuccess) onSuccess();
        } else {
            if (onError) onError('Quiz not found');
        }
    } catch (error) {
        if (onError) onError(error.message);
    }
}

/**
 * Set up navigation warning for in-progress quiz
 * @param {Function} isQuizIncomplete - Function that returns true if quiz is incomplete
 */
export function setupNavigationWarning(isQuizIncomplete) {
    window.addEventListener('beforeunload', (e) => {
        if (isQuizIncomplete()) {
            e.preventDefault();
            e.returnValue = 'You have unanswered questions. Your progress will be saved. Are you sure you want to leave?';
            return e.returnValue;
        }
    });
}

/**
 * Initialize navigation system
 * @param {string} currentPage - Current page identifier
 * @param {Object} options - Navigation options
 */
export function initNavigation(currentPage = 'library', options = {}) {
    const { showWarningOnLeave = false, isQuizIncomplete = null } = options;
    
    // Add navigation bar to page
    const navBar = createNavigationBar(currentPage);
    document.body.insertBefore(navBar, document.body.firstChild);
    
    // Set up global navigation function
    window.navigateToLibrary = () => {
        navigateToLibrary(showWarningOnLeave && isQuizIncomplete && isQuizIncomplete());
    };
    
    // Set up navigation warning if needed
    if (showWarningOnLeave && isQuizIncomplete) {
        setupNavigationWarning(isQuizIncomplete);
    }
}
