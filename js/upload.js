/**
 * Upload Handler
 * Handles quiz file upload and validation
 */

import { parseAndValidateQuiz } from './validation.js';

/**
 * Initialize upload functionality
 * Sets up event listeners for file upload
 */
export function initUpload() {
    const uploadBtn = document.getElementById('upload-btn');
    if (!uploadBtn) return;
    
    // Create hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json,application/json';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle upload button click
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle file selection
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            await handleFileUpload(file);
            // Reset input so same file can be selected again
            fileInput.value = '';
        }
    });
}

/**
 * Handle file upload process
 * @param {File} file - The file to upload
 */
async function handleFileUpload(file) {
    // Validate file type
    if (!file.name.endsWith('.json')) {
        showUploadStatus('error', 'Invalid file type. Please upload a JSON file.');
        return;
    }
    
    try {
        showUploadStatus('loading', 'Reading file...');
        
        // Read file content
        const content = await readFileContent(file);
        
        // Validate quiz format
        showUploadStatus('loading', 'Validating quiz format...');
        const validation = parseAndValidateQuiz(content);
        
        if (!validation.valid) {
            const errorMessage = 'Invalid quiz format:\n' + validation.errors.join('\n');
            showUploadStatus('error', errorMessage);
            return;
        }
        
        // Upload to server
        showUploadStatus('loading', 'Uploading quiz...');
        await uploadQuiz(file, validation.data);
        
        showUploadStatus('success', 'Quiz uploaded successfully! Refreshing library...');
        
        // Refresh the quiz library after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        showUploadStatus('error', `Upload failed: ${error.message}`);
    }
}

/**
 * Read file content as text
 * @param {File} file - The file to read
 * @returns {Promise<string>} File content
 */
function readFileContent(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (event) => {
            resolve(event.target.result);
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        
        reader.readAsText(file);
    });
}

/**
 * Upload quiz (hybrid: local file + Vercel Blob)
 * Stores quiz in localStorage for immediate use
 * Also attempts to save to server if available
 * @param {File} file - The file to upload
 * @param {object} quizData - The validated quiz data
 * @returns {Promise<void>}
 */
async function uploadQuiz(file, quizData) {
    // Generate quiz ID from filename
    const quizId = file.name.replace('.json', '').toLowerCase().replace(/[^a-z0-9-]/g, '-');
    
    // Generate title from filename (convert to readable format)
    const titleFromFilename = file.name
        .replace('.json', '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
    
    // Try to upload to server first (if API is available)
    let serverUploadSuccess = false;
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('quizData', JSON.stringify(quizData));
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            serverUploadSuccess = true;
            console.log('Quiz uploaded to server successfully');
        }
    } catch (error) {
        console.log('Server upload not available, using localStorage only:', error.message);
    }
    
    // Always store in localStorage as fallback/cache
    const uploadedQuizzes = JSON.parse(localStorage.getItem('uploadedQuizzes') || '{}');
    
    uploadedQuizzes[quizId] = {
        id: quizId,
        title: quizData.title || titleFromFilename,
        description: quizData.description || '',
        difficulty: quizData.difficulty || 'medium',
        questionCount: quizData.questions.length,
        data: quizData,
        uploadedAt: new Date().toISOString(),
        serverBacked: serverUploadSuccess
    };
    
    localStorage.setItem('uploadedQuizzes', JSON.stringify(uploadedQuizzes));
    
    return { success: true, quizId, serverBacked: serverUploadSuccess };
}

/**
 * Show upload status message
 * @param {string} status - Status type: 'loading', 'success', 'error'
 * @param {string} message - Status message to display
 */
export function showUploadStatus(status, message) {
    // Remove existing status message
    const existingStatus = document.getElementById('upload-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Create status message element
    const statusDiv = document.createElement('div');
    statusDiv.id = 'upload-status';
    statusDiv.className = `upload-status upload-status-${status}`;
    
    // Add icon based on status
    let icon = '';
    if (status === 'loading') {
        icon = '⏳';
    } else if (status === 'success') {
        icon = '✓';
    } else if (status === 'error') {
        icon = '✗';
    }
    
    statusDiv.innerHTML = `
        <span class="status-icon">${icon}</span>
        <span class="status-message">${message.replace(/\n/g, '<br>')}</span>
    `;
    
    // Insert after header
    const header = document.querySelector('header');
    if (header) {
        header.insertAdjacentElement('afterend', statusDiv);
    } else {
        document.body.insertBefore(statusDiv, document.body.firstChild);
    }
    
    // Auto-remove success messages after 3 seconds
    if (status === 'success') {
        setTimeout(() => {
            statusDiv.remove();
        }, 3000);
    }
}
