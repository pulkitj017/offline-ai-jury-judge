
# AI Jury Backend

This is the backend service for the AI Jury application. It provides a REST API for analyzing GitHub repositories.

## Features

- Clone GitHub repositories
- Analyze commit history
- Extract commit metadata, changed files, and diffs
- Clean up after analysis

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run start:dev
```

## API Endpoints

### POST /git/analyze

Analyze a GitHub repository.

Request Body:
```json
{
  "repoUrl": "https://github.com/user/repo",
  "teamName": "Team Name"
}
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "hash": "commit-hash",
      "author": "Author Name",
      "email": "author@example.com",
      "timestamp": "2023-04-01T12:00:00Z",
      "message": "Commit message",
      "changedFiles": ["file1.js", "file2.js"],
      "diff": "diff content..."
    }
  ]
}
```
