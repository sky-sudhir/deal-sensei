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

### 4. Schema-Level Embedding Generation

Embedding generation is now implemented directly at the Mongoose schema level using pre-save and pre-findOneAndUpdate hooks. This ensures embeddings are generated immediately when documents are saved or updated, regardless of how the operation is triggered.

```javascript
// Example from deal.schema.js
DealSchema.pre('save', async function(next) {
  try {
    // Only generate embedding if document is new or relevant fields have changed
    if (this.isNew || this.isModified('title') || this.isModified('notes') || 
        this.isModified('value') || this.isModified('stage')) {
      const embeddingData = await createEntityEmbedding(this, 'deal');
      if (embeddingData && embeddingData.embedding_vector) {
        this.ai_embedding = embeddingData.embedding_vector;
      }
    }
    next();
  } catch (error) {
    console.error(`Error generating embedding for deal ${this._id}:`, error);
    // Continue saving even if embedding generation fails
    next();
  }
});
```

Similar hooks are implemented for contacts and activities.

### 5. Backup Middleware

The `embedding.middleware.js` file now provides backup middleware functions that only generate embeddings if they don't already exist. This handles edge cases where schema hooks might not trigger:

- `generateEmbeddingMiddleware(entityType)`: Generic middleware for any entity type

### 6. API Endpoint

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

## Schema-Level Implementation Details

### Advantages of Schema-Level Embedding

Implementing embedding generation at the schema level offers several advantages:

1. **Reliability**: Embeddings are generated immediately when documents are saved or updated, regardless of how the operation is triggered (API, script, etc.)

2. **Consistency**: The same embedding generation logic applies to all operations that modify the document

3. **Efficiency**: Embeddings are only generated when relevant fields change, reducing unnecessary processing

4. **Resilience**: Failed embedding generation doesn't prevent document saving, ensuring core functionality remains intact

### Implementation Strategy

For each entity type (deal, contact, activity), we've implemented:

1. **Pre-save hook**: Triggers when new documents are created or existing documents are updated via `save()`

2. **Pre-findOneAndUpdate hook**: Triggers when documents are updated via `findOneAndUpdate()` or `findByIdAndUpdate()`

3. **Field change detection**: Only generates new embeddings when relevant fields change (e.g., title, notes, content)

4. **Error handling**: Gracefully handles embedding generation failures without blocking document operations

### Testing

A test script is available to verify the schema-level embedding generation:

```
node scripts/test-schema-embedding.js <company_id> <user_id>
```

This script tests:
- Creating new deals, contacts, and activities (triggering pre-save hooks)
- Updating existing entities (triggering pre-findOneAndUpdate hooks)
- Verifying embedding generation in both cases

## Usage

### Automatic Embedding Generation

Embeddings are automatically generated when:

1. A new deal, contact, or activity is created (via Mongoose schema pre-save hook)
2. An existing entity is updated (via Mongoose schema pre-findOneAndUpdate hook)
3. The backup middleware is triggered for operations that bypass Mongoose hooks

The schema-level implementation ensures that embeddings are generated regardless of how the document is saved or updated, making the process more reliable than route-level middleware alone.

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

### API Testing
1. Use the `test-embedding-generation.js` script to test the API endpoint
2. Check MongoDB to verify that entities have the `ai_embedding` field populated

### Schema-Level Testing
1. Use the `test-schema-embedding.js` script to test schema-level embedding generation:
   ```bash
   node scripts/test-schema-embedding.js <company_id> <user_id>
   ```
2. This script tests both creation and update operations to verify that schema hooks are properly generating embeddings

## Troubleshooting

### General Issues
- If embeddings are not being generated, check the Gemini API key in the `.env` file
- For batch processing errors, check the logs for specific entity IDs that failed
- Ensure the MongoDB connection is stable for large batch operations

### Schema-Level Issues
- If schema hooks aren't generating embeddings, check console logs for errors during save/update operations
- Verify that the `createEntityEmbedding` function is properly imported in schema files
- For `findOneAndUpdate` operations, ensure they're returning the updated document with `{ new: true }`
- If using bulk operations that bypass Mongoose middleware, use the backup middleware or manually trigger embedding generation

### Performance Considerations
- Schema-level embedding generation adds processing time to save/update operations
- For bulk imports or migrations, consider disabling hooks temporarily and using batch processing instead
- Monitor memory usage during high-volume operations as embedding generation can be resource-intensive
