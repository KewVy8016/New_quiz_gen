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
            // Show quiz name input modal
            showQuizNameModal(file);
            // Reset input so same file can be selected again
            fileInput.value = '';
        }
    });
}

/**
 * Show modal to input quiz name
 * @param {File} file - The file to upload
 */
function showQuizNameModal(file) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'upload-modal-overlay';
    
    // Generate default name from filename
    const defaultName = file.name
        .replace('.json', '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, char => char.toUpperCase());
    
    modal.innerHTML = `
        <div class="upload-modal">
            <h2>ตั้งชื่อข้อสอบ</h2>
            <p>กรุณาใส่ชื่อสำหรับข้อสอบนี้</p>
            <input 
                type="text" 
                id="quiz-name-input" 
                class="quiz-name-input" 
                placeholder="ชื่อข้อสอบ"
                value="${defaultName}"
                maxlength="100"
            />
            <div class="upload-modal-buttons">
                <button class="modal-button modal-cancel">ยกเลิก</button>
                <button class="modal-button modal-confirm">อัปโหลด</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Focus on input
    const input = document.getElementById('quiz-name-input');
    input.focus();
    input.select();
    
    // Handle cancel
    const cancelBtn = modal.querySelector('.modal-cancel');
    cancelBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    // Handle confirm
    const confirmBtn = modal.querySelector('.modal-confirm');
    const handleConfirm = async () => {
        const quizName = input.value.trim();
        
        if (!quizName) {
            input.style.borderColor = '#e74c3c';
            input.focus();
            return;
        }
        
        modal.remove();
        await handleFileUpload(file, quizName);
    };
    
    confirmBtn.addEventListener('click', handleConfirm);
    
    // Handle Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleConfirm();
        }
    });
    
    // Handle Escape key
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });
}

/**
 * Handle file upload process
 * @param {File} file - The file to upload
 * @param {string} quizName - The custom name for the quiz
 */
async function handleFileUpload(file, quizName) {
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
        await uploadQuiz(file, validation.data, quizName);
        
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
 * Upload quiz to server
 * Attempts to save to server/file system
 * Falls back to localStorage only if server is unavailable
 * @param {File} file - The file to upload
 * @param {object} quizData - The validated quiz data
 * @param {string} customName - The custom name for the quiz
 * @returns {Promise<void>}
 */
async function uploadQuiz(file, quizData, customName) {
    // Generate quiz ID from custom name
    const quizId = customName.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, '-').replace(/^-+|-+$/g, '');
    
    // Update quiz data with custom name
    quizData.title = customName;
    
    // Try to upload to server/save as file
    try {
        const formData = new FormData();
        
        // Create a new file with the custom name
        const newFileName = `${quizId}.json`;
        const newFile = new File([JSON.stringify(quizData, null, 2)], newFileName, { type: 'application/json' });
        
        formData.append('file', newFile);
        formData.append('quizData', JSON.stringify(quizData));
        formData.append('customName', customName);
        
        console.log('Uploading to /api/upload...');
        
        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const result = await response.json();
            console.log('✓ Quiz uploaded to server successfully:', result);
            
            // Clear localStorage version if exists
            const uploadedQuizzes = JSON.parse(localStorage.getItem('uploadedQuizzes') || '{}');
            if (uploadedQuizzes[quizId]) {
                delete uploadedQuizzes[quizId];
                localStorage.setItem('uploadedQuizzes', JSON.stringify(uploadedQuizzes));
                console.log('✓ Cleared localStorage version');
            }
            
            return { success: true, quizId, serverBacked: true };
        } else {
            // Try to get error details
            let errorMessage = 'Server returned error';
            let errorDetails = null;
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.message || errorData.error || errorMessage;
                errorDetails = errorData;
                console.error('Server error details:', errorData);
                
                // Check if it's a Blob Storage configuration error
                if (errorData.error === 'Blob Storage not configured') {
                    // Show helpful message to user
                    const helpMessage = `
                        ⚠️ Vercel Blob Storage ยังไม่ได้ตั้งค่า
                        
                        กรุณาทำตามขั้นตอน:
                        1. ไปที่ Vercel Dashboard → Storage
                        2. สร้าง Blob Storage ใหม่
                        3. Connect กับ Project นี้
                        4. Redeploy application
                        
                        ดูรายละเอียดใน SETUP_VERCEL_BLOB.md
                    `;
                    throw new Error(helpMessage);
                }
            } catch (e) {
                if (e.message.includes('Vercel Blob Storage')) {
                    throw e; // Re-throw our custom error
                }
                const errorText = await response.text();
                console.error('Server error (text):', errorText);
                errorMessage = errorText || errorMessage;
            }
            
            throw new Error(`Upload failed (${response.status}): ${errorMessage}`);
        }
    } catch (error) {
        console.error('❌ Server upload failed:', error);
        
        // Check if it's a network error (server not available)
        const isNetworkError = error.message.includes('fetch') || 
                               error.message.includes('NetworkError') ||
                               error.message.includes('Failed to fetch');
        
        if (isNetworkError) {
            console.warn('⚠️ Server not available, using localStorage fallback');
            
            // Fallback: Store in localStorage only if server is not available
            const uploadedQuizzes = JSON.parse(localStorage.getItem('uploadedQuizzes') || '{}');
            
            uploadedQuizzes[quizId] = {
                id: quizId,
                title: customName,
                description: quizData.description || '',
                difficulty: quizData.difficulty || 'medium',
                questionCount: quizData.questions.length,
                data: quizData,
                uploadedAt: new Date().toISOString(),
                serverBacked: false
            };
            
            localStorage.setItem('uploadedQuizzes', JSON.stringify(uploadedQuizzes));
            
            return { success: true, quizId, serverBacked: false };
        } else {
            // If it's not a network error, throw it to show user
            throw error;
        }
    }
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
