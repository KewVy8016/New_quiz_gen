# Upload API Documentation

## Overview

The `/api/upload` endpoint is a Vercel serverless function that handles quiz file uploads to Vercel Blob Storage. It validates quiz files, stores them securely, and updates the quiz manifest.

## Endpoint Details

**URL:** `/api/upload`  
**Method:** `POST`  
**Content-Type:** `multipart/form-data`

## Request

### Form Data Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| file | File | Yes | Quiz JSON file to upload |

### Example Request

```javascript
const formData = new FormData();
formData.append('file', quizFile);

const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
});
```

## Response

### Success Response (200 OK)

```json
{
  "success": true,
  "message": "Quiz uploaded successfully",
  "quiz": {
    "id": "javascript-basics",
    "title": "JavaScript Basics",
    "description": "Test your JavaScript knowledge",
    "difficulty": "easy",
    "questionCount": 10,
    "filePath": "https://blob.vercel-storage.com/quizzes/javascript-basics.json"
  }
}
```

### Error Responses

#### 405 Method Not Allowed
```json
{
  "error": "Method not allowed",
  "message": "Only POST requests are accepted"
}
```

#### 400 Bad Request - Invalid File Type
```json
{
  "error": "Invalid file type",
  "message": "Only .json files are accepted"
}
```

#### 400 Bad Request - Invalid JSON
```json
{
  "error": "Invalid JSON",
  "message": "Failed to parse JSON: Unexpected token..."
}
```

#### 400 Bad Request - Invalid Quiz Format
```json
{
  "error": "Invalid quiz format",
  "message": "Quiz validation failed",
  "errors": [
    "Missing or invalid \"title\" field (must be a string)",
    "Question 1: \"correct\" index 5 is out of bounds (must be between 0 and 3)"
  ]
}
```

#### 500 Internal Server Error
```json
{
  "error": "Upload failed",
  "message": "Blob storage unavailable"
}
```

## Implementation Details

### Validation

The endpoint performs server-side validation to ensure security:

1. **File Type Validation**: Only `.json` files are accepted
2. **JSON Parsing**: Validates that the file contains valid JSON
3. **Schema Validation**: Validates against the quiz schema:
   - Required fields: `title`, `description`, `difficulty`, `questions`
   - Valid difficulty values: `easy`, `medium`, `hard`
   - Questions array must not be empty
   - Each question must have valid structure
   - Answer indices must be within bounds

### Storage

- Files are uploaded to Vercel Blob Storage with public access
- Stored at path: `quizzes/{quiz-id}.json`
- Quiz ID is generated from the title (lowercase, hyphenated)

### Quiz List Update

The endpoint automatically updates `/json/quiz-list.json`:
- Adds new quiz metadata to the manifest
- Updates existing quiz if ID already exists
- Creates the file if it doesn't exist

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| BLOB_READ_WRITE_TOKEN | Vercel Blob Storage access token | Yes |

Set in Vercel dashboard or via CLI:
```bash
vercel env add BLOB_READ_WRITE_TOKEN
```

### Vercel Configuration

The `vercel.json` file configures:
- Serverless function routing
- Maximum execution duration (10 seconds)
- Environment variable injection

## Testing

Unit tests are available in `api/upload.test.js`:

```bash
npm test api/upload.test.js
```

Test coverage includes:
- Method validation (POST only)
- File type validation
- JSON parsing errors
- Quiz schema validation
- Answer index bounds checking
- Successful upload flow
- Blob storage error handling
- Missing headers handling

## Security Considerations

1. **Server-Side Validation**: All validation is performed server-side, even though client-side validation exists
2. **File Type Restriction**: Only JSON files are accepted
3. **Schema Enforcement**: Strict schema validation prevents malformed data
4. **Error Messages**: Descriptive but not overly revealing
5. **Access Control**: Blob storage uses public access for quiz files (read-only for users)

## Limitations

- Maximum file size: Limited by Vercel's request body size limit (4.5 MB)
- Maximum execution time: 10 seconds (configured in vercel.json)
- No authentication: Anyone can upload quizzes (add authentication if needed)
- No rate limiting: Consider adding rate limiting for production use

## Future Enhancements

- Add user authentication
- Implement rate limiting
- Add quiz ownership/management
- Support quiz updates and deletions
- Add file size validation
- Implement virus scanning for uploaded files
