import AiEmbedding from "./ai.schema.js";
import {
  generateEmbedding,
  processTextForEmbedding,
} from "../../utils/aiUtils.js";
import "dotenv/config";
import CustomError from "../../utils/CustomError.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Types } from "mongoose";

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy-key");

class AiRepository {
  constructor() {}

  async generateAIContentUsingPrompt(prompt) {
    try {
      // Use the generative model
      const generativeModel = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL,
        generationConfig: { temperature: 0.3 },
      });

      // Generate content
      const result = await generativeModel.generateContent(prompt);
      const content = result.response.text();

      return content;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  // Store or update an embedding for an entity
  async storeEmbedding(
    entityType,
    entityId,
    companyId,
    embeddingVector,
    contentSummary,
    dealId = null,
    contactId = null
  ) {
    try {
      // Check if embedding already exists
      const existingEmbedding = await AiEmbedding.findOne({
        entity_type: entityType,
        entity_id: entityId,
      });

      if (existingEmbedding) {
        // Update existing embedding
        existingEmbedding.embedding_vector = embeddingVector;
        existingEmbedding.content_summary = contentSummary;
        existingEmbedding.last_updated = new Date();

        // Update deal_id and contact_id if provided
        if (dealId) existingEmbedding.deal_id = dealId;
        if (contactId) existingEmbedding.contact_id = contactId;

        return await existingEmbedding.save();
      } else {
        // Create new embedding
        const newEmbedding = new AiEmbedding({
          entity_type: entityType,
          entity_id: entityId,
          company_id: companyId,
          embedding_vector: embeddingVector,
          content_summary: contentSummary,
          deal_id: dealId,
          contact_id: contactId,
        });
        return await newEmbedding.save();
      }
    } catch (error) {
      throw error;
    }
  }

  // Get embedding for an entity
  async getEmbedding(entityType, entityId) {
    try {
      return await AiEmbedding.findOne({
        entity_type: entityType,
        entity_id: entityId,
      });
    } catch (error) {
      throw error;
    }
  }

  // Find similar entities based on vector similarity
  async findSimilarEntities(
    embeddingVector,
    companyId,
    dealIds,
    contactIds,
    limit = 5
  ) {
    try {
      const andFilters = [];

      andFilters.push({
        company_id: Types.ObjectId.createFromHexString(companyId),
      });

      if (Array.isArray(contactIds) && contactIds.length > 0) {
        andFilters.push({
          contact_id: {
            $in: contactIds.map((id) => Types.ObjectId.createFromHexString(id)),
          },
        });
      }

      if (Array.isArray(dealIds) && dealIds.length > 0) {
        andFilters.push({
          deal_id: {
            $in: dealIds.map((id) => Types.ObjectId.createFromHexString(id)),
          },
        });
      }

      let finalFilter = {};

      if (andFilters.length === 1) {
        // Only one condition (company_id)
        finalFilter = andFilters[0];
      } else if (andFilters.length > 1) {
        // More than one condition: use $and
        finalFilter = { $and: andFilters };
      }

      // console.log(finalFilter, "wwwwwwwwwwwwwwwwww");

      const results = await AiEmbedding.aggregate([
        {
          $vectorSearch: {
            filter: finalFilter,
            index: "default",
            limit,
            numCandidates: limit * 3,
            path: "embedding_vector",
            queryVector: embeddingVector,
          },
        },
      ]);

      return results;
    } catch (error) {
      throw new CustomError(error);
    }
  }

  // Generate embedding for text
  async generateEmbeddingForText(text) {
    try {
      const processedText = processTextForEmbedding(text);
      return await generateEmbedding(processedText);
    } catch (error) {
      throw new CustomError(error);
    }
  }
}

export default AiRepository;
