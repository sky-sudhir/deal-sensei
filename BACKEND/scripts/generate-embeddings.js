import mongoose from "mongoose";
import "dotenv/config";

import { DealModel } from "../src/feature/deal/deal.schema.js";
import { ContactModel } from "../src/feature/contact/contact.schema.js";
import { ActivityModel } from "../src/feature/activity/activity.schema.js";
import { generateAndStoreEmbedding } from "../src/utils/aiUtils.js";

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

/**
 * Generate embeddings for entities that don't have them
 * @param {string} entityType - Type of entity (deal, contact, activity)
 * @param {string} companyId - Company ID to filter entities
 * @param {number} limit - Maximum number of entities to process
 */
async function generateEmbeddings(entityType, companyId, limit = 50) {
  try {
    console.log(`Generating embeddings for ${entityType}s...`);

    // Select the appropriate model based on entity type
    let model;
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
        throw new Error(`Invalid entity type: ${entityType}`);
    }

    // Find entities without embeddings
    const query = {
      company_id: companyId,
      $or: [
        { ai_embedding: { $exists: false } },
        { ai_embedding: { $size: 0 } },
        { ai_embedding: null },
      ],
    };

    const entities = await model.find(query).limit(limit);
    console.log(`Found ${entities.length} ${entityType}s without embeddings`);

    // Generate embeddings for each entity
    let successCount = 0;
    let errorCount = 0;

    for (const entity of entities) {
      try {
        const embedding = await generateAndStoreEmbedding(
          entity,
          entityType,
          model
        );
        if (embedding) {
          successCount++;
          console.log(`Generated embedding for ${entityType} ${entity._id}`);
        } else {
          errorCount++;
          console.error(
            `Failed to generate embedding for ${entityType} ${entity._id}`
          );
        }
      } catch (error) {
        errorCount++;
        console.error(
          `Error generating embedding for ${entityType} ${entity._id}:`,
          error
        );
      }
    }

    console.log(`Embedding generation complete for ${entityType}s`);
    console.log(
      `Success: ${successCount}, Errors: ${errorCount}, Total: ${entities.length}`
    );

    return {
      entityType,
      total: entities.length,
      success: successCount,
      error: errorCount,
    };
  } catch (error) {
    console.error(`Error in generateEmbeddings for ${entityType}:`, error);
    return {
      entityType,
      total: 0,
      success: 0,
      error: 1,
      errorMessage: error.message,
    };
  }
}

// Main function to run the script
async function main() {
  try {
    // Replace with an actual company ID from your database
    const companyId = process.argv[2];

    if (!companyId) {
      console.error("Please provide a company ID as the first argument");
      process.exit(1);
    }

    // Generate embeddings for all entity types
    const dealResults = await generateEmbeddings("deal", companyId);
    const contactResults = await generateEmbeddings("contact", companyId);
    const activityResults = await generateEmbeddings("activity", companyId);

    console.log("\nSummary:");
    console.log("Deals:", dealResults);
    console.log("Contacts:", contactResults);
    console.log("Activities:", activityResults);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error in main function:", error);
    process.exit(1);
  }
}

// Run the script
main();
