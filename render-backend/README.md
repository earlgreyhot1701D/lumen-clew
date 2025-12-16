# Lumen Clew Backend

Backend service for Lumen Clew code scanner. Runs on Render.com with Node.js.

## Structure

```
render-backend/
├── server.js              # Express server entry point
├── package.json           # Dependencies
├── api/
│   └── scan.js           # POST /api/scan endpoint handler
├── lib/
│   ├── config.js         # Configuration constants
│   ├── types.js          # JSDoc type definitions
│   └── validateGithubUrl.js
└── utils/
    ├── orchestrateScan.js    # Main scan orchestration
    ├── gitHubFetcher.js      # GitHub repo fetching
    ├── runESLint.js          # ESLint runner
    ├── runNpmAudit.js        # npm audit runner
    ├── runSecretsScanner.js  # Secrets detection
    ├── runA11yAnalyzer.js    # Accessibility analysis
    └── claudeTranslator.js   # Claude AI translation
```

## Deployment to Render

1. Create a new GitHub repository and push this folder's contents
2. On Render Dashboard, create a new Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variable:
   - `ANTHROPIC_API_KEY` = your Anthropic API key
   - `DEBUG` = `true` (optional, for verbose logging)
6. Deploy!

## Endpoints

### `GET /health`
Health check endpoint. Returns:
```json
{ "status": "ok", "timestamp": "2024-..." }
```

### `POST /api/scan`
Main scan endpoint. Request body:
```json
{
  "repoUrl": "https://github.com/owner/repo",
  "scanMode": "fast"  // or "full"
}
```

Response:
```json
{
  "status": "success" | "partial" | "error",
  "report": { ... },
  "rateLimit": { ... }
}
```

## Rate Limiting

- 3 scans per day per IP address
- Resets at midnight UTC

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key for finding translation |
| `PORT` | No | Server port (default: 3000) |
| `DEBUG` | No | Set to "true" for verbose logging |
