/**
 * Quiz JSON Schema Validation
 * Validates quiz files against the required schema
 */

/**
 * Validates a quiz object against the schema
 * Supports both formats:
 * 1. Simple format: array of questions directly
 * 2. Full format: object with title, description, difficulty, questions
 * @param {any} data - The data to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validateQuizFormat(data) {
    const errors = [];
    
    // Check if data exists
    if (!data) {
        errors.push('Quiz data is required');
        return { valid: false, errors };
    }
    
    // Check if data is an array (simple format) or object (full format)
    if (Array.isArray(data)) {
        // Simple format: array of questions directly
        if (data.length === 0) {
            errors.push('Questions array cannot be empty');
            return { valid: false, errors };
        }
        
        // Validate each question
        data.forEach((question, index) => {
            const questionErrors = validateQuestion(question, index);
            errors.push(...questionErrors);
        });
    } else if (typeof data === 'object') {
        // Full format: object with metadata
        // Validate metadata fields (optional in simple format)
        if (data.title && typeof data.title !== 'string') {
            errors.push('Invalid "title" field (must be a string)');
        }
        
        if (data.description && typeof data.description !== 'string') {
            errors.push('Invalid "description" field (must be a string)');
        }
        
        if (data.difficulty && !['easy', 'medium', 'hard'].includes(data.difficulty)) {
            errors.push('Invalid "difficulty" field (must be "easy", "medium", or "hard")');
        }
        
        // Validate questions array
        if (!Array.isArray(data.questions)) {
            errors.push('Missing or invalid "questions" field (must be an array)');
            return { valid: false, errors };
        }
        
        if (data.questions.length === 0) {
            errors.push('Questions array cannot be empty');
        }
        
        // Validate each question
        data.questions.forEach((question, index) => {
            const questionErrors = validateQuestion(question, index);
            errors.push(...questionErrors);
        });
    } else {
        errors.push('Quiz data must be an array of questions or an object with questions field');
        return { valid: false, errors };
    }
    
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
    
    // Validate question text
    if (!question.text || typeof question.text !== 'string') {
        errors.push(`${prefix} Missing or invalid "text" field (must be a string)`);
    }
    
    // Validate answers array
    if (!Array.isArray(question.answers)) {
        errors.push(`${prefix} Missing or invalid "answers" field (must be an array)`);
        return errors;
    }
    
    if (question.answers.length === 0) {
        errors.push(`${prefix} Answers array cannot be empty`);
    }
    
    // Check if answers are in new format (array of objects) or old format (array of strings)
    const isNewFormat = question.answers.length > 0 && typeof question.answers[0] === 'object';
    
    if (isNewFormat) {
        // New format: answers = [{text: string, correct: boolean}, ...]
        question.answers.forEach((answer, answerIndex) => {
            if (typeof answer !== 'object' || answer === null) {
                errors.push(`${prefix} Answer ${answerIndex + 1} must be an object with 'text' and 'correct' fields`);
            } else {
                if (typeof answer.text !== 'string') {
                    errors.push(`${prefix} Answer ${answerIndex + 1} must have a 'text' field (string)`);
                }
                if (typeof answer.correct !== 'boolean') {
                    errors.push(`${prefix} Answer ${answerIndex + 1} must have a 'correct' field (boolean)`);
                }
            }
        });
        
        // Check that exactly one answer is marked as correct
        const correctCount = question.answers.filter(a => a.correct === true).length;
        if (correctCount === 0) {
            errors.push(`${prefix} Must have at least one correct answer`);
        } else if (correctCount > 1) {
            errors.push(`${prefix} Must have exactly one correct answer (found ${correctCount})`);
        }
    } else {
        // Old format: answers = [string, string, ...] with separate 'correct' field
        question.answers.forEach((answer, answerIndex) => {
            if (typeof answer !== 'string') {
                errors.push(`${prefix} Answer ${answerIndex + 1} must be a string`);
            }
        });
        
        // Validate correct answer index
        if (typeof question.correct !== 'number') {
            errors.push(`${prefix} Missing or invalid "correct" field (must be a number)`);
        } else if (!Number.isInteger(question.correct)) {
            errors.push(`${prefix} "correct" field must be an integer`);
        } else if (question.correct < 0 || question.correct >= question.answers.length) {
            errors.push(`${prefix} "correct" index ${question.correct} is out of bounds (must be between 0 and ${question.answers.length - 1})`);
        }
    }
    
    // Validate info field (optional but if present must be string)
    if (question.info !== undefined && typeof question.info !== 'string') {
        errors.push(`${prefix} "info" field must be a string if provided`);
    }
    
    return errors;
}

/**
 * Parses and validates a quiz JSON string
 * Automatically converts new format to old format for compatibility
 * @param {string} jsonString - The JSON string to parse
 * @returns {{valid: boolean, data: any, errors: string[]}} Parse and validation result
 */
export function parseAndValidateQuiz(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        // Convert new format to old format if needed
        const convertedData = convertQuizFormat(data);
        
        const validation = validateQuizFormat(convertedData);
        return {
            valid: validation.valid,
            data: validation.valid ? convertedData : null,
            errors: validation.errors
        };
    } catch (error) {
        return {
            valid: false,
            data: null,
            errors: [`Invalid JSON: ${error.message}`]
        };
    }
}

/**
 * Convert new quiz format to old format for compatibility
 * Handles multiple input formats:
 * 1. Simple format (array of questions)
 * 2. Full format (object with metadata)
 * 3. Complex format (with id, quiz_id, timestamps, etc.)
 * @param {object|array} quiz - Quiz data in any supported format
 * @returns {object} Quiz object in standardized old format
 */
function convertQuizFormat(quiz) {
    if (!quiz) {
        return quiz;
    }
    
    let quizData;
    
    // Handle array format (simple or complex)
    if (Array.isArray(quiz)) {
        // Check if it's complex format (has id, quiz_id, etc.)
        const isComplexFormat = quiz.length > 0 && 
                               quiz[0].hasOwnProperty('id') && 
                               quiz[0].hasOwnProperty('quiz_id');
        
        if (isComplexFormat) {
            // Convert complex format to simple format
            const convertedQuestions = quiz.map(q => convertComplexQuestion(q));
            quizData = {
                title: 'Quiz',
                description: 'Quiz questions',
                difficulty: 'medium',
                questions: convertedQuestions
            };
        } else {
            // Simple array format
            quizData = {
                title: 'Quiz',
                description: 'Quiz questions',
                difficulty: 'medium',
                questions: quiz
            };
        }
    } else {
        quizData = { ...quiz };
    }
    
    // Ensure questions array exists
    if (!Array.isArray(quizData.questions)) {
        return quizData;
    }
    
    // Convert each question to old format
    quizData.questions = quizData.questions.map(question => {
        // Check if this question uses new format (answers as objects)
        if (Array.isArray(question.answers) && 
            question.answers.length > 0 && 
            typeof question.answers[0] === 'object' &&
            question.answers[0].hasOwnProperty('text')) {
            
            // Convert to old format
            const answerTexts = question.answers.map(a => a.text);
            const correctIndex = question.answers.findIndex(a => a.correct === true);
            
            return {
                text: question.text,
                answers: answerTexts,
                correct: correctIndex >= 0 ? correctIndex : 0,
                info: question.info || '',
                difficulty: question.difficulty || 'medium'
            };
        }
        
        // Already in old format, return as is
        return question;
    });
    
    return quizData;
}

/**
 * Convert complex question format to simple format
 * Extracts only necessary fields from complex API response
 * @param {object} complexQuestion - Question with id, quiz_id, timestamps, etc.
 * @returns {object} Simplified question object
 */
function convertComplexQuestion(complexQuestion) {
    // Extract answers and convert to simple format
    const answers = (complexQuestion.answers || []).map(answer => ({
        text: answer.text,
        correct: answer.correct === true
    }));
    
    // Return simplified question
    return {
        text: complexQuestion.text || '',
        info: complexQuestion.info || '',
        difficulty: complexQuestion.difficulty || 'medium',
        answers: answers
    };
}

/**
 * Serializes a quiz object to JSON string
 * @param {object} quiz - The quiz object to serialize
 * @returns {string} JSON string
 */
export function serializeQuiz(quiz) {
    return JSON.stringify(quiz, null, 2);
}
