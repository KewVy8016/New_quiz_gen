/**
 * Vercel Serverless Function for Quiz Upload
 * This endpoint handles quiz file uploads to Vercel Blob Storage
 * 
 * Functionality:
 * 1. Receive multipart/form-data with quiz file
 * 2. Validate quiz format (server-side validation for security)
 * 3. Upload to Vercel Blob Storage
 * 4. Update quiz-list.json with new quiz metadata
 * 5. Return success/error response
 */

import { put } from '@vercel/blob';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

// Disable body parsing to handle multipart data manually
export const config = {
    api: {
        bodyParser: false
    }
};

/**
 * Validates a quiz object against the schema
 * @param {any} data - The data to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
function validateQuizFormat(data) {
    const errors = [];
    
    if (!data || typeof data !== 'object') {
        errors.push('Quiz data must be an object');
        return { valid: false, errors };
    }
    
    if (!data.title || typeof data.title !== 'string') {
        errors.push('Missing or invalid "title" field (must be a string)');
    }
    
    if (!data.description || typeof data.description !== 'string') {
        errors.push('Missing or invalid "description" field (must be a string)');
    }
    
    if (!data.difficulty || !['easy', 'medium', 'hard'].includes(data.difficulty)) {
        errors.push('Missing or invalid "difficulty" field (must be "easy", "medium", or "hard")');
    }
    
    if (!Array.isArray(data.questions)) {
        errors.push('Missing or invalid "questions" field (must be an array)');
        return { valid: false, errors };
    }
    
    if (data.questions.length === 0) {
        errors.push('Questions array cannot be empty');
    }
    
    data.questions.forEach((question, index) => {
        const questionErrors = validateQuestion(question, index);
        errors.push(...questionErrors);
    });
    
    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validates a single question object
 * @param {any} question - The question to validate
 * @param {number} index - The question index for error messages
 * @returns {string[]} Array of error messages
 */
function validateQuestion(question, index) {
    const errors = [];
    const prefix = `Question ${index + 1}:`;
    
    if (!question || typeof question !== 'object') {
        errors.push(`${prefix} Must be an object`);
        return errors;
    }
    
    if (!question.text || typeof question.text !== 'string') {
        errors.push(`${prefix} Missing or invalid "text" field (must be a string)`);
    }
    
    if (!Array.isArray(question.answers)) {
        errors.push(`${prefix} Missing or invalid "answers" field (must be an array)`);
        return errors;
    }
    
    if (question.answers.length === 0) {
        errors.push(`${prefix} Answers array cannot be empty`);
    }
    
    question.answers.forEach((answer, answerIndex) => {
        if (typeof answer !== 'string') {
            errors.push(`${prefix} Answer ${answerIndex + 1} must be a string`);
        }
    });
    
    if (typeof question.correct !== 'number') {
        errors.push(`${prefix} Missing or invalid "correct" field (must be a number)`);
    } else if (!Number.isInteger(question.correct)) {
        errors.push(`${prefix} "correct" field must be an integer`);
    } else if (question.correct < 0 || question.correct >= question.answers.length) {
        errors.push(`${prefix} "correct" index ${question.correct} is out of bounds (must be between 0 and ${question.answers.length - 1})`);
    }
    
    if (question.difficulty !== undefined && !['easy', 'medium', 'hard'].includes(question.difficulty)) {
        errors.push(`${prefix} Invalid "difficulty" field (must be "easy", "medium", or "hard")`);
    }
    
    if (question.info !== undefined && typeof question.info !== 'string') {
        errors.push(`${prefix} "info" field must be a string if provided`);
    }
    
    return errors;
}

/**
 * Generates a unique quiz ID from the title
 * @param {string} title - The quiz title
 * @returns {string} A URL-safe quiz ID
 */
function generateQuizId(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Parses multipart form data to extract file content
 * Uses a simple parser for Vercel environment
 * @param {Request} req - The request object
 * @returns {Promise<{content: string, filename: string}>} File content and name
 */
async function parseFormData(req) {
    // Vercel provides body-parser middleware, but for file uploads
    // we need to handle the raw multipart data
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('multipart/form-data')) {
        throw new Error('Content-Type must be multipart/form-data');
    }
    
    // Extract boundary from content-type header
    const boundaryMatch = contentType.match(/boundary=(.+)$/);
    if (!boundaryMatch) {
        throw new Error('No boundary found in multipart data');
    }
    const boundary = boundaryMatch[1];
    
    // Get raw body as buffer
    const chunks = [];
    for await (const chunk of req) {
        chunks.push(chunk);
    }
    const body = Buffer.concat(chunks).toString('utf-8');
    
    // Parse multipart sections
    const parts = body.split(`--${boundary}`);
    
    for (const part of parts) {
        // Skip empty parts and closing boundary
        if (!part || part === '--\r\n' || part === '--') continue;
        
        // Check if this part contains a file
        if (part.includes('Content-Disposition') && part.includes('name="file"')) {
            // Extract filename
            const filenameMatch = part.match(/filename="([^"]+)"/);
            const filename = filenameMatch ? filenameMatch[1] : 'quiz.json';
            
            // Extract content (everything after the double CRLF)
            const headerEnd = part.indexOf('\r\n\r\n');
            if (headerEnd === -1) continue;
            
            const contentStart = headerEnd + 4;
            const contentEnd = part.lastIndexOf('\r\n');
            const content = part.substring(contentStart, contentEnd > contentStart ? contentEnd : undefined);
            
            return { content, filename };
        }
    }
    
    throw new Error('No file found in form data');
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only POST requests are accepted'
        });
    }

    try {
        // Check if running locally
        const isLocal = !process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN;
        
        // 1. Parse multipart form data
        const { content, filename } = await parseFormData(req);
        
        // Validate file extension
        if (!filename.endsWith('.json')) {
            return res.status(400).json({
                error: 'Invalid file type',
                message: 'Only .json files are accepted'
            });
        }
        
        // 2. Parse and validate quiz format
        let quizData;
        try {
            quizData = JSON.parse(content);
        } catch (error) {
            return res.status(400).json({
                error: 'Invalid JSON',
                message: `Failed to parse JSON: ${error.message}`
            });
        }
        
        const validation = validateQuizFormat(quizData);
        if (!validation.valid) {
            return res.status(400).json({
                error: 'Invalid quiz format',
                message: 'Quiz validation failed',
                errors: validation.errors
            });
        }
        
        // 3. Generate quiz ID
        const quizId = generateQuizId(quizData.title);
        
        if (isLocal) {
            // LOCAL DEVELOPMENT: Save to json/ folder
            const jsonDir = join(process.cwd(), 'json');
            const quizFilePath = join(jsonDir, `${quizId}.json`);
            
            // Write quiz file
            await writeFile(quizFilePath, JSON.stringify(quizData, null, 2), 'utf-8');
            
            // Update quiz-list.json
            const quizListPath = join(jsonDir, 'quiz-list.json');
            let quizList;
            
            try {
                const quizListContent = await readFile(quizListPath, 'utf-8');
                quizList = JSON.parse(quizListContent);
            } catch (error) {
                quizList = { quizzes: [] };
            }
            
            const existingIndex = quizList.quizzes.findIndex(q => q.id === quizId);
            const newQuizMetadata = {
                id: quizId,
                title: quizData.title,
                description: quizData.description,
                difficulty: quizData.difficulty,
                questionCount: quizData.questions.length,
                file: `json/${quizId}.json`
            };
            
            if (existingIndex >= 0) {
                quizList.quizzes[existingIndex] = newQuizMetadata;
            } else {
                quizList.quizzes.push(newQuizMetadata);
            }
            
            await writeFile(quizListPath, JSON.stringify(quizList, null, 2), 'utf-8');
            
            return res.status(200).json({
                success: true,
                message: 'Quiz uploaded successfully (local)',
                quiz: newQuizMetadata,
                location: 'local'
            });
            
        } else {
            // VERCEL PRODUCTION: Use Blob Storage
            const blobFilename = `quizzes/${quizId}.json`;
            
            const blob = await put(blobFilename, content, {
                access: 'public',
                contentType: 'application/json'
            });
            
            // Update quiz-list.json
            const quizListPath = join(process.cwd(), 'json', 'quiz-list.json');
            let quizList;
            
            try {
                const quizListContent = await readFile(quizListPath, 'utf-8');
                quizList = JSON.parse(quizListContent);
            } catch (error) {
                quizList = { quizzes: [] };
            }
            
            const existingIndex = quizList.quizzes.findIndex(q => q.id === quizId);
            const newQuizMetadata = {
                id: quizId,
                title: quizData.title,
                description: quizData.description,
                difficulty: quizData.difficulty,
                questionCount: quizData.questions.length,
                filePath: blob.url
            };
            
            if (existingIndex >= 0) {
                quizList.quizzes[existingIndex] = newQuizMetadata;
            } else {
                quizList.quizzes.push(newQuizMetadata);
            }
            
            await writeFile(quizListPath, JSON.stringify(quizList, null, 2), 'utf-8');
            
            return res.status(200).json({
                success: true,
                message: 'Quiz uploaded successfully (Vercel Blob)',
                quiz: newQuizMetadata,
                location: 'vercel-blob'
            });
        }

    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({
            error: 'Upload failed',
            message: error.message || 'An unexpected error occurred'
        });
    }
}
