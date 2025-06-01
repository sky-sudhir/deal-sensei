import { createEntityEmbedding } from "../utils/aiUtils.js";
import { DealModel } from "../feature/deal/deal.schema.js";
import { ContactModel } from "../feature/contact/contact.schema.js";
import { ActivityModel } from "../feature/activity/activity.schema.js";
import mongoose from "mongoose";

/**
 * Middleware to ensure embedding generation for entities after they are created or updated
 * This middleware is now a backup to the schema-level embedding generation
 * It's useful for operations that bypass Mongoose hooks (like bulk operations)
 * @param {string} entityType - The type of entity (deal, contact, activity)
 * @returns {Function} - Express middleware function
 */
export const generateEmbeddingMiddleware = (entityType) => {
  return async (req, res, next) => {
    try {
      // Skip if no response data or if it's not a success response
      if (!res.locals.data || res.statusCode >= 400) {
        return next();
      }

      const entity = res.locals.data;
      let model;

      // Determine the model based on entity type
      switch (entityType) {
        case "deal":
          model = DealModel;
          break;
        case "contact":
          model = ContactModel;
          break;
        case "activity":
          model = ActivityModel;
          break;
        default:
          console.error(`Unsupported entity type: ${entityType}`);
          return next();
      }
      
      // Check if the entity already has embeddings
      if (!entity.ai_embedding || entity.ai_embedding.length === 0) {
        console.log(`Backup middleware: Generating embedding for ${entityType} ${entity._id}`);
        
        // Generate embedding
        const embeddingData = await createEntityEmbedding(entity, entityType);
        if (embeddingData && embeddingData.embedding_vector) {
          // Update the entity with the embedding vector
          await model.findByIdAndUpdate(entity._id, { 
            ai_embedding: embeddingData.embedding_vector 
          });
          console.log(`Backup middleware: Generated embedding for ${entityType} ${entity._id}`);
        }
      }

      // Continue with the response
      return next();
    } catch (error) {
      console.error(`Error in embedding middleware for ${entityType}:`, error);
      return next();
    }
  };
};

/**
 * Middleware factory to generate embeddings for deals
 */
export const generateDealEmbedding = generateEmbeddingMiddleware("deal");

/**
 * Middleware factory to generate embeddings for contacts
 */
export const generateContactEmbedding = generateEmbeddingMiddleware("contact");

/**
 * Middleware factory to generate embeddings for activities
 */
export const generateActivityEmbedding =
  generateEmbeddingMiddleware("activity");
