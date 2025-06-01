// This file contains utility functions for AI operations
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

/**
 * Generate an embedding vector for the given text
 * @param {string} text - The text to generate an embedding for
 * @returns {Promise<number[]>} - A promise that resolves to an embedding vector
 */
export async function generateEmbedding(text) {
  try {
    // Use the embedding model
    const embeddingModel = genAI.getGenerativeModel({ model: "embedding-001" });

    // Generate embedding
    const result = await embeddingModel.embedContent(text);
    const embedding = result.embedding.values;

    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    // Return a default embedding vector with zeros in case of error
    return new Array(512).fill(0);
  }
}

/**
 * Generate a content summary for the given text
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} - A promise that resolves to a summary
 */
export async function generateContentSummary(text) {
  try {
    // Use the generative model
    const generativeModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.2 },
    });

    // Generate summary
    const prompt = `Summarize the following text in 2-3 sentences:\n\n${text}`;
    const result = await generativeModel.generateContent(prompt);
    const summary = result.response.text();

    return summary;
  } catch (error) {
    console.error("Error generating summary:", error);
    // Return a default summary in case of error
    return "No summary available.";
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
  try {
    let textToEmbed = "";
    let contentSummary = "";

    // Format text based on entity type
    switch (entityType) {
      case "deal":
        textToEmbed = `Deal: ${entity.title}. Value: ${entity.value}. Stage: ${entity.stage}. Status: ${entity.status || "open"}. Notes: ${entity.notes || ""}`;
        contentSummary = `Deal: ${entity.title} - ${entity.value}`;
        break;
      case "contact":
        textToEmbed = `Contact: ${entity.name}. Email: ${entity.email || ""}. Phone: ${entity.phone || ""}. Notes: ${entity.notes || ""}`;
        contentSummary = `Contact: ${entity.name}`;
        break;
      case "activity":
        textToEmbed = `Activity: ${entity.type}. Subject: ${entity.subject}. Content: ${entity.content}. Next steps: ${entity.next_steps || ""}`;
        contentSummary = `Activity: ${entity.subject}`;
        break;
      case "email_template":
        textToEmbed = `Template: ${entity.name}. Subject: ${entity.subject}. Body: ${entity.body}`;
        contentSummary = `Template: ${entity.name}`;
        break;
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
      content_summary: contentSummary.substring(0, 200), // Limit summary length
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
      console.error(`Failed to create embedding for ${entityType} ${entity._id}`);
      return null;
    }
    
    // Update the entity with the embedding vector
    await model.findByIdAndUpdate(entity._id, { 
      ai_embedding: embeddingData.embedding_vector 
    });
    
    // Store in AI embeddings collection if needed
    // This would require importing and using the AiEmbedding model or repository
    
    return embeddingData.embedding_vector;
  } catch (error) {
    console.error(`Error generating and storing embedding for ${entityType}:`, error);
    return null;
  }
}
