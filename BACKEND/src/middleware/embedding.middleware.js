import { generateAndStoreEmbedding } from "../utils/aiUtils.js";
import { DealModel } from "../feature/deal/deal.schema.js";
import { ContactModel } from "../feature/contact/contact.schema.js";
import { ActivityModel } from "../feature/activity/activity.schema.js";

/**
 * Middleware to generate and store embeddings for entities after they are created or updated
 * This middleware should be added to the relevant routes after the controller methods
 * @param {string} entityType - The type of entity (deal, contact, activity)
 * @returns {Function} - Express middleware function
 */
export const generateEmbeddingMiddleware = (entityType) => {
  console.log(entityType, "entityType");
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
      console.log(model, entityType, entity, "qqqqqqqqqqqqqq");
      // Generate embedding asynchronously (don't wait for it to complete)
      generateAndStoreEmbedding(entity, entityType, model)
        .then((embedding) => {
          console.log(`Generated embedding for ${entityType} ${entity._id}`);
        })
        .catch((error) => {
          console.error(
            `Error generating embedding for ${entityType} ${entity._id}:`,
            error
          );
        });

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
