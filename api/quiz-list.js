/**
 * Vercel Serverless Function to get quiz list
 * Returns list of all quizzes from Blob Storage or local json/
 */

import { list } from '@vercel/blob';
import { readFile } from 'fs/promises';
import { join } from 'path';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ 
            error: 'Method not allowed',
            message: 'Only GET requests are accepted'
        });
    }

    try {
        // Check if running locally
        const isLocal = !process.env.VERCEL && !process.env.BLOB_READ_WRITE_TOKEN;
        
        if (isLocal) {
            // LOCAL: Read from json/quiz-list.json
            const quizListPath = join(process.cwd(), 'json', 'quiz-list.json');
            
            try {
                const content = await readFile(quizListPath, 'utf-8');
                const quizList = JSON.parse(content);
                
                return res.status(200).json({
                    success: true,
                    quizzes: quizList.quizzes || [],
                    source: 'local'
                });
            } catch (error) {
                return res.status(200).json({
                    success: true,
                    quizzes: [],
                    source: 'local',
                    message: 'No quiz-list.json found'
                });
            }
            
        } else {
            // VERCEL: Read from Blob Storage
            try {
                // Try to fetch quiz-list.json from Blob Storage
                const { blobs } = await list({ prefix: 'quiz-list.json', limit: 1 });
                
                if (blobs.length > 0) {
                    const response = await fetch(blobs[0].url);
                    if (response.ok) {
                        const quizList = await response.json();
                        return res.status(200).json({
                            success: true,
                            quizzes: quizList.quizzes || [],
                            source: 'blob-storage',
                            url: blobs[0].url
                        });
                    }
                }
                
                // If quiz-list.json doesn't exist, build it from individual quiz files
                const { blobs: quizBlobs } = await list({ prefix: 'quizzes/' });
                const quizzes = [];
                
                for (const blob of quizBlobs) {
                    if (blob.pathname.endsWith('.json')) {
                        try {
                            const response = await fetch(blob.url);
                            if (response.ok) {
                                const quizData = await response.json();
                                const quizId = blob.pathname.replace('quizzes/', '').replace('.json', '');
                                
                                quizzes.push({
                                    id: quizId,
                                    title: quizData.title,
                                    description: quizData.description,
                                    difficulty: quizData.difficulty,
                                    questionCount: quizData.questions?.length || 0,
                                    filePath: blob.url
                                });
                            }
                        } catch (error) {
                            console.error(`Error fetching quiz ${blob.pathname}:`, error);
                        }
                    }
                }
                
                return res.status(200).json({
                    success: true,
                    quizzes,
                    source: 'blob-storage-dynamic',
                    message: 'Built from individual quiz files'
                });
                
            } catch (error) {
                console.error('Error fetching from Blob Storage:', error);
                return res.status(200).json({
                    success: true,
                    quizzes: [],
                    source: 'blob-storage',
                    error: error.message
                });
            }
        }
        
    } catch (error) {
        console.error('Error in quiz-list handler:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch quiz list',
            message: error.message
        });
    }
}
