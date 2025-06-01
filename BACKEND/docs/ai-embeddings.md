# AI Embedding Generation Integration

This document outlines the implementation of AI embedding generation using Google Gemini SDK across all collections in the Deal Sensei platform.

## Overview

Every collection (deals, contacts, activities, etc.) now has consistent AI embedding generation and storage using Google Gemini SDK. This enables vector similarity search and powers AI features like Deal Coach, Persona Builder, Objection Handler, and Win-Loss Explainer.

## Implementation Details

### 1. Schema Structure

All entity schemas include an `ai_embedding` field defined as an array of numbers:

```javascript
ai_embedding: {
  type: [Number],
  default: null,
  index: false // Vector indexes are created separately
}
```

### 2. Utility Functions

The `aiUtils.js` file contains core functions for embedding generation:

- `createEntityEmbedding(entity, entityType)`: Formats entity data and generates embeddings
- `generateAndStoreEmbedding(entity, entityType, model)`: Generates and stores embeddings in both the entity document and AI embeddings collection

### 3. Repository Methods

The `ai.repository.js` file contains methods for:

- `generateAndStoreEntityEmbedding(entity, entityType)`: Unified method for generating and storing embeddings
- `batchGenerateEmbeddings(companyId, entityType, limit)`: Batch processing for entities missing embeddings

### 4. Middleware

The `embedding.middleware.js` file provides middleware functions to automatically generate embeddings when entities are created or updated:

- `generateDealEmbedding`: For deal entities
- `generateContactEmbedding`: For contact entities
- `generateActivityEmbedding`: For activity entities

### 5. API Endpoint

A new admin-only endpoint is available to trigger batch embedding generation:

```
POST /api/v1/ai/generate-embeddings
```

Request body:
```json
{
  "entity_type": "deal", // or "contact" or "activity"
  "limit": 100 // optional, defaults to 100, max 500
}
```

## Usage

### Automatic Embedding Generation

Embeddings are automatically generated when:

1. New entities are created
2. Existing entities are updated

The middleware handles this process asynchronously, so it doesn't block the response.

### Batch Embedding Generation

For existing entities without embeddings, use one of these methods:

#### 1. API Endpoint (Admin Only)

```javascript
// Example fetch request
const response = await fetch('/api/v1/ai/generate-embeddings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    entity_type: 'deal',
    limit: 100
  })
});
```

#### 2. Script

Run the script with a company ID:

```bash
node scripts/generate-embeddings.js <company_id>
```

## Testing

1. Use the `test-embedding-generation.js` script to test the API endpoint
2. Check MongoDB to verify that entities have the `ai_embedding` field populated

## Troubleshooting

- If embeddings are not being generated, check the Gemini API key in the `.env` file
- For batch processing errors, check the logs for specific entity IDs that failed
- Ensure the MongoDB connection is stable for large batch operations
