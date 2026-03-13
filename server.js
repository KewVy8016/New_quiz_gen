/**
 * Simple Local Development Server
 * Handles quiz uploads and saves to json/ folder
 */

const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { parse } = require('url');

const PORT = 3000;

// MIME types
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

/**
 * Parse multipart form data
 */
async function parseMultipartFormData(req) {
    return new Promise((resolve, reject) => {
        const contentType = req.headers['content-type'] || '';
        const boundaryMatch = contentType.match(/boundary=(.+)$/);
        
        if (!boundaryMatch) {
            reject(new Error('No boundary found'));
            return;
        }
        
        const boundary = boundaryMatch[1];
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const parts = body.split(`--${boundary}`);
                const result = {};
                
                for (const part of parts) {
                    if (!part || part === '--\r\n' || part === '--') continue;
                    
                    // Extract field name
                    const nameMatch = part.match(/name="([^"]+)"/);
                    if (!nameMatch) continue;
                    
                    const fieldName = nameMatch[1];
                    
                    // Extract content
                    const headerEnd = part.indexOf('\r\n\r\n');
                    if (headerEnd === -1) continue;
                    
                    const contentStart = headerEnd + 4;
                    const contentEnd = part.lastIndexOf('\r\n');
                    const content = part.substring(contentStart, contentEnd > contentStart ? contentEnd : undefined);
                    
                    // Check if it's a file
                    if (part.includes('filename=')) {
                        const filenameMatch = part.match(/filename="([^"]+)"/);
                        result[fieldName] = {
                            filename: filenameMatch ? filenameMatch[1] : 'file',
                            content: content
                        };
                    } else {
                        result[fieldName] = content;
                    }
                }
                
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
        
        req.on('error', reject);
    });
}

/**
 * Handle quiz list request
 */
async function handleQuizList(req, res) {
    try {
        const jsonDir = path.join(__dirname, 'json');
        const quizListPath = path.join(jsonDir, 'quiz-list.json');
        
        try {
            const content = await fs.readFile(quizListPath, 'utf-8');
            const quizList = JSON.parse(content);
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                quizzes: quizList.quizzes || [],
                source: 'local'
            }));
        } catch (error) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                quizzes: [],
                source: 'local',
                message: 'No quiz-list.json found'
            }));
        }
    } catch (error) {
        console.error('Quiz list error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: false,
            error: 'Failed to fetch quiz list',
            message: error.message
        }));
    }
}

/**
 * Handle quiz upload
 */
async function handleUpload(req, res) {
    try {
        const formData = await parseMultipartFormData(req);
        
        if (!formData.file) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No file uploaded' }));
            return;
        }
        
        // Parse quiz data
        const quizData = JSON.parse(formData.file.content);
        const customName = formData.customName || quizData.title;
        
        // Generate quiz ID from custom name
        const quizId = customName.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, '-').replace(/^-+|-+$/g, '');
        
        // Update quiz data with custom name
        quizData.title = customName;
        
        // Save quiz file
        const jsonDir = path.join(__dirname, 'json');
        const quizFilePath = path.join(jsonDir, `${quizId}.json`);
        
        await fs.writeFile(quizFilePath, JSON.stringify(quizData, null, 2), 'utf-8');
        console.log(`✓ Saved quiz to: ${quizFilePath}`);
        
        // Update quiz-list.json
        const quizListPath = path.join(jsonDir, 'quiz-list.json');
        let quizList;
        
        try {
            const quizListContent = await fs.readFile(quizListPath, 'utf-8');
            quizList = JSON.parse(quizListContent);
        } catch (error) {
            quizList = { quizzes: [] };
        }
        
        const existingIndex = quizList.quizzes.findIndex(q => q.id === quizId);
        const newQuizMetadata = {
            id: quizId,
            title: customName,
            description: quizData.description,
            difficulty: quizData.difficulty,
            questionCount: quizData.questions.length,
            file: `json/${quizId}.json`
        };
        
        if (existingIndex >= 0) {
            quizList.quizzes[existingIndex] = newQuizMetadata;
            console.log(`✓ Updated quiz in list: ${customName}`);
        } else {
            quizList.quizzes.push(newQuizMetadata);
            console.log(`✓ Added new quiz to list: ${customName}`);
        }
        
        await fs.writeFile(quizListPath, JSON.stringify(quizList, null, 2), 'utf-8');
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            message: 'Quiz uploaded successfully',
            quiz: newQuizMetadata
        }));
        
    } catch (error) {
        console.error('Upload error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            error: 'Upload failed',
            message: error.message
        }));
    }
}

/**
 * Serve static files
 */
async function serveStaticFile(filePath, res) {
    try {
        const content = await fs.readFile(filePath);
        const ext = path.extname(filePath);
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
}

/**
 * Main request handler
 */
const server = http.createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    console.log(`${req.method} ${pathname}`);
    
    // Handle API upload endpoint
    if (pathname === '/api/upload' && req.method === 'POST') {
        await handleUpload(req, res);
        return;
    }
    
    // Handle API quiz-list endpoint
    if (pathname === '/api/quiz-list' && req.method === 'GET') {
        await handleQuizList(req, res);
        return;
    }
    
    // Serve static files
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    // Check if file exists
    try {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
            filePath = path.join(filePath, 'index.html');
        }
        await serveStaticFile(filePath, res);
    } catch (error) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 QuizFlow Development Server`);
    console.log(`📍 Server running at: http://localhost:${PORT}`);
    console.log(`📁 Serving files from: ${__dirname}`);
    console.log(`\n✓ Quiz uploads will be saved to: json/`);
    console.log(`\nPress Ctrl+C to stop\n`);
});
