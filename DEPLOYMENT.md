# QuizFlow Deployment Guide

## Vercel Deployment

QuizFlow is configured for deployment on Vercel with static file hosting and serverless functions.

### Prerequisites

1. Vercel account
2. Vercel CLI installed: `npm i -g vercel`
3. Vercel Blob Storage enabled

### Deployment Steps

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy to Vercel**:
   ```bash
   vercel
   ```

4. **Set up Vercel Blob Storage**:
   - Go to your project dashboard on Vercel
   - Navigate to Storage tab
   - Create a new Blob Store
   - Copy the `BLOB_READ_WRITE_TOKEN`

5. **Configure Environment Variables**:
   ```bash
   vercel env add BLOB_READ_WRITE_TOKEN
   ```
   Paste your token when prompted.

6. **Deploy to Production**:
   ```bash
   vercel --prod
   ```

### Configuration

The `vercel.json` file includes:

- **Static File Serving**: All HTML, CSS, JS, and JSON files are served statically
- **Serverless Functions**: API routes in `/api` directory
- **Blob Storage**: For user-uploaded quiz files
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection
- **Caching**: JSON files cached for 5 minutes (client) / 10 minutes (CDN)

### File Structure

```
/
├── index.html              # Library page
├── pages/                  # Quiz pages
│   ├── mode-selection.html
│   ├── quiz.html
│   ├── results.html
│   └── review.html
├── js/                     # JavaScript modules
├── css/                    # Stylesheets
├── json/                   # Quiz data files
├── api/                    # Serverless functions
│   └── upload.js          # Quiz upload endpoint
└── vercel.json            # Vercel configuration
```

### Testing Deployment

After deployment, test:

1. Quiz library loads correctly
2. Quiz taking works in both modes
3. Progress is saved to localStorage
4. Results display correctly
5. File upload works (requires Blob Storage setup)

### Troubleshooting

- **Quiz list not loading**: Check `/json/quiz-list.json` is accessible
- **Upload fails**: Verify `BLOB_READ_WRITE_TOKEN` is set correctly
- **404 errors**: Ensure `vercel.json` routes are configured properly
- **CORS issues**: Check API function responses include proper headers

### Local Development

Run locally with Vercel CLI:

```bash
vercel dev
```

This starts a local development server with serverless function support.
