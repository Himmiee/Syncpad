# API Documentation

## Accessing the Documentation

The SyncPad API documentation is available via Swagger UI at:

**Local Development:**
```
http://localhost:3030/api-docs
```

**Production:**
```
https://api.syncpad.com/api-docs
```

## Features

- Interactive API explorer with "Try it out" functionality
- Complete request/response schemas
- Authentication support (Bearer tokens)
- Example requests and responses
- Organized by feature tags (Notes, Share, Invitations, Audit, Versions)

## Using the Documentation

### 1. Authenticate
Click the "Authorize" button at the top right and enter your Bearer token:
```
Bearer your-jwt-token-here
```

### 2. Try Endpoints
- Select an endpoint
- Click "Try it out"
- Fill in required parameters
- Click "Execute"
- View the response

## OpenAPI Specification

The OpenAPI 3.0 specification is located at:
```
server/docs/openapi.yaml
```

This file serves as the single source of truth for the API and can be used to:
- Generate client SDKs
- Generate server stubs
- Validate requests/responses
- Import into Postman or other API tools

## Available Endpoints

### Notes
- GET /v1/notes - List all notes (with pagination)
- POST /v1/notes - Create a note
- GET /v1/notes/:id - Get a specific note
- PATCH /v1/notes/:id - Update a note
- DELETE /v1/notes/:id - Delete a note

### Share
- POST /v1/share/note/:id/link - Create shareable link
- GET /v1/share/note/:id/links - List share links
- GET /v1/share/public/:token - Access shared note (public)
- PATCH /v1/share/link/:token - Update share link
- DELETE /v1/share/link/:token - Revoke share link

### Invitations
- POST /v1/invitations/send - Send invitation
- GET /v1/invitations/note/:id - List invitations
- POST /v1/invitations/accept/:token - Accept invitation
- DELETE /v1/invitations/:id - Revoke invitation

### Audit
- GET /v1/audit/note/:id - Get note audit logs
- GET /v1/audit/my-activity - Get user activity

### Versions
- GET /v1/versions/note/:id - List all versions
- GET /v1/versions/note/:id/:version - Get specific version
- POST /v1/versions/note/:id/restore/:version - Restore to version

## Updating the Documentation

When adding new endpoints or modifying existing ones:

1. Update `docs/openapi.yaml` with the changes
2. The documentation will automatically reflect the updates
3. No code changes needed - schema-first approach

## Error Responses

All errors follow a standardized format:
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "statusCode": 404
  }
}
```

Common error codes:
- `NOT_FOUND` (404)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `VALIDATION_ERROR` (400)
- `CONFLICT` (409)
- `INTERNAL_SERVER_ERROR` (500)
