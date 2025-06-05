// This file contains utility functions for AI operations
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import CustomError from "./CustomError.js";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate an embedding vector for the given text
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<number[]>} - A promise that resolves to an embedding vector
 */
export async function generateEmbedding(text) {
  try {
    // Use the embedding model
    const embeddingModel = genAI.getGenerativeModel({
      model: process.env.GEMINI_EMBEDDING_MODEL,
    });

    // Generate embedding
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding.values;

    return embedding;
  } catch (error) {
    throw new CustomError(error);
  }
}

/**
 * Process text for embedding by cleaning and normalizing
 * @param {string} text - The text to process
 * @returns {string} - The processed text
 */
export function processTextForEmbedding(text) {
  if (!text) return "";

  // Convert to string if not already
  const textStr = String(text);

  // Remove excessive whitespace
  let processed = textStr.replace(/\s+/g, " ").trim();

  // Limit length to avoid token limits
  if (processed.length > 8000) {
    processed = processed.substring(0, 8000);
  }

  return processed;
}

/**
 * Create embedding data for an entity
 * @param {Object} entity - The entity to create embedding for
 * @param {string} entityType - The type of entity (deal, contact, etc.)
 * @returns {Promise<Object>} - A promise that resolves to embedding data
 */
export async function createEntityEmbedding(entity, entityType) {
  // console.log(JSON.stringify(entity), entityType, "qqqqqqqqqqqqqqqqqq");
  try {
    let textToEmbed = "";
    let contentSummary = "";

    // Format text based on entity type
    switch (entityType) {
      case "message":
        textToEmbed = `Context: ${entity.message_user}. Updated At: ${entity.updated_at}`;

        break;
      case "deal":
        textToEmbed = `Deal Title: ${entity.title}. Value: ${
          entity.value
        }.Deal Amount: ${entity.value} Stage: ${entity.stage}. Status: ${
          entity.status || "open"
        }. Win Probability: ${
          entity.pipeline_id.stages.find((stage) => stage.name === entity.stage)
            ?.win_probability || ""
        }. Close Date: ${entity.close_date || ""}. Notes: ${
          entity.notes || ""
        }. Pipeline Name: ${entity.pipeline_id.name}. ${entity.contact_ids
          .map(
            (v) =>
              `Contact Name: ${v.name}. Email: ${v.email || ""}. Phone: ${
                v.phone || ""
              }.`
          )
          .join(" ")}. Owner Name: ${entity.owner_id.name}. Owner Email: ${
          entity.owner_id.email
        }. Updated At: ${entity.updated_at}`;
        contentSummary = `Deal: ${entity.title} - ${entity.value}`;
        break;
      case "contact":
        textToEmbed = `Contact Name: ${entity.name}. Email: ${
          entity.email || ""
        }. Phone: ${entity.phone || ""}. Notes: ${
          entity.notes || ""
        }. Updated At: ${entity.updated_at}`;
        contentSummary = `Contact: ${entity.name}`;
        break;
      case "activity":
        textToEmbed = `Activity Type: ${entity.type}. Subject: ${
          entity.subject
        }. Content: ${entity.content}. Next steps: ${
          entity.next_steps || ""
        }. Duration Minutes: ${
          entity.duration_minutes || ""
        }. Sentiment Score: ${
          entity.sentiment_score || ""
        } Objections Mentioned: ${entity.objections_mentioned.join(
          ", "
        )}. Next Steps: ${entity.next_steps || ""}. Contact Name: ${
          entity?.contact_id?.name
        }. Contact Email: ${entity?.contact_id?.email}. Deal Title: ${
          entity?.deal_id?.title
        }. Deal Value: ${entity?.deal_id?.value}. Updated At: ${
          entity.updated_at
        }. `;
        contentSummary = `Activity: ${entity.subject}`;
        break;
      case "file":
        textToEmbed = `File Name: ${entity.filename}. File Type: ${
          entity.file_type
        }. File URL: ${entity.s3_url}. Attached To: ${
          entity.attached_to_type
        }.${
          entity?.contact_id
            ? ` Contact Name: ${entity?.contact_id?.name}. Contact Email: ${entity?.contact_id?.email}`
            : ""
        }.${
          entity?.deal_id
            ? ` Deal Title: ${entity?.deal_id?.title}. Deal Value: ${entity?.deal_id?.value}`
            : ""
        }. Updated At: ${entity.updated_at}`;
        contentSummary = `File: ${entity.filename}`;
        break;
      // case "email_template":
      //   textToEmbed = `Id: ${entity._id}. Template: ${entity.name}. Subject: ${entity.subject}. Body: ${entity.body} Updated At: ${entity.updated_at}`;
      //   contentSummary = `Template: ${entity.name}`;
      //   break;
      default:
        textToEmbed = JSON.stringify(entity);
        contentSummary = `${entityType}: ${entity._id}`;
    }

    // Process and generate embedding
    const processedText = processTextForEmbedding(textToEmbed);
    const embeddingVector = await generateEmbedding(processedText);

    return {
      entity_type: entityType,
      entity_id: entity._id,
      company_id: entity.company_id,
      embedding_vector: embeddingVector,
      content_summary: textToEmbed, // Limit summary length
    };
  } catch (error) {
    console.error(`Error creating embedding for ${entityType}:`, error);
    return null;
  }
}

/**
 * Generate and store embedding for any entity type
 * This function can be used in middleware or directly in controllers
 * @param {Object} entity - The entity to generate embedding for
 * @param {string} entityType - The type of entity (deal, contact, etc.)
 * @param {Object} model - The mongoose model to update
 * @returns {Promise<number[]>} - A promise that resolves to the embedding vector
 */
export async function generateAndStoreEmbedding(entity, entityType, model) {
  try {
    // Generate embedding data
    const embeddingData = await createEntityEmbedding(entity, entityType);

    if (!embeddingData) {
      console.error(
        `Failed to create embedding for ${entityType} ${entity._id}`
      );
      return null;
    }

    // Update the entity with the embedding vector
    await model.findByIdAndUpdate(entity._id, {
      ai_embedding: embeddingData.embedding_vector,
    });

    // Store in AI embeddings collection if needed
    // This would require importing and using the AiEmbedding model or repository

    return embeddingData.embedding_vector;
  } catch (error) {
    console.error(
      `Error generating and storing embedding for ${entityType}:`,
      error
    );
    return null;
  }
}
