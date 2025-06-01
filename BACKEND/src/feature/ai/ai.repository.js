import AiEmbedding from "./ai.schema.js";
import { DealModel } from "../deal/deal.schema.js";
import { ContactModel } from "../contact/contact.schema.js";
import { ActivityModel } from "../activity/activity.schema.js";
import {
  generateEmbedding,
  processTextForEmbedding,
  createEntityEmbedding,
  generateAndStoreEmbedding
} from "../../utils/aiUtils.js";

class AiRepository {
  constructor() {}

  // Store or update an embedding for an entity
  async storeEmbedding(
    entityType,
    entityId,
    companyId,
    embeddingVector,
    contentSummary
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
        return await existingEmbedding.save();
      } else {
        // Create new embedding
        const newEmbedding = new AiEmbedding({
          entity_type: entityType,
          entity_id: entityId,
          company_id: companyId,
          embedding_vector: embeddingVector,
          content_summary: contentSummary,
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
  async findSimilarEntities(embeddingVector, companyId, entityType, limit = 5) {
    try {
      return await AiEmbedding.find({
        company_id: companyId,
        entity_type: entityType,
      })
        .sort({
          embedding_vector: {
            $vectorSearch: {
              queryVector: embeddingVector,
              path: "embedding_vector",
              numCandidates: limit * 3, // Fetch more candidates for better results
              limit: limit,
            },
          },
        })
        .populate("entity_id")
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }

  // Find similar entities across multiple entity types
  async findSimilarEntitiesAcrossTypes(embeddingVector, companyId, limit = 10) {
    try {
      return await AiEmbedding.find({
        company_id: companyId,
      })
        .sort({
          embedding_vector: {
            $vectorSearch: {
              queryVector: embeddingVector,
              path: "embedding_vector",
              numCandidates: limit * 3,
              limit: limit,
            },
          },
        })
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }

  // Generate embedding for text
  async generateEmbeddingForText(text) {
    try {
      const processedText = processTextForEmbedding(text);
      return await generateEmbedding(processedText);
    } catch (error) {
      console.error("Error generating embedding for text:", error);
      // Return a zero vector as fallback (appropriate dimension for the model)
      return new Array(768).fill(0);
    }
  }
  
  // Generate embedding for any entity and store it in both the entity collection and AI embeddings collection
  async generateAndStoreEntityEmbedding(entity, entityType) {
    try {
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
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
      
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
      
      // Store in AI embeddings collection
      await this.storeEmbedding(
        entityType,
        entity._id,
        entity.company_id,
        embeddingData.embedding_vector,
        embeddingData.content_summary
      );
      
      return embeddingData.embedding_vector;
    } catch (error) {
      console.error(`Error generating and storing embedding for ${entityType}:`, error);
      return null;
    }
  }

  // Generate and store embedding for a deal
  async generateAndStoreEmbeddingForDeal(deal) {
    try {
      return await this.generateAndStoreEntityEmbedding(deal, "deal");
    } catch (error) {
      console.error("Error generating embedding for deal:", error);
      throw error;
    }
  }

  // Generate and store embedding for a contact
  async generateAndStoreEmbeddingForContact(contact) {
    try {
      return await this.generateAndStoreEntityEmbedding(contact, "contact");
    } catch (error) {
      console.error("Error generating embedding for contact:", error);
      throw error;
    }
  }

  // Generate and store embedding for an activity
  async generateAndStoreEmbeddingForActivity(activity) {
    try {
      return await this.generateAndStoreEntityEmbedding(activity, "activity");
    } catch (error) {
      console.error("Error generating embedding for activity:", error);
      throw error;
    }
  }
  
  // Batch generate embeddings for entities that don't have them
  async batchGenerateEmbeddings(companyId, entityType, limit = 100) {
    try {
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
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
      
      // Find entities without embeddings
      const entities = await model.find({
        company_id: companyId,
        $or: [
          { ai_embedding: { $exists: false } },
          { ai_embedding: { $size: 0 } },
          { ai_embedding: null }
        ]
      }).limit(limit);
      
      console.log(`Found ${entities.length} ${entityType}s without embeddings`);
      
      // Generate embeddings for each entity
      const results = [];
      for (const entity of entities) {
        try {
          const embedding = await this.generateAndStoreEntityEmbedding(entity, entityType);
          if (embedding) {
            results.push({
              id: entity._id,
              success: true
            });
          } else {
            results.push({
              id: entity._id,
              success: false,
              error: "Failed to generate embedding"
            });
          }
        } catch (error) {
          results.push({
            id: entity._id,
            success: false,
            error: error.message
          });
        }
      }
      
      return {
        total: entities.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      };
    } catch (error) {
      console.error(`Error batch generating embeddings for ${entityType}:`, error);
      throw error;
    }
  }

  // Get relevant context for a deal
  async getRelevantContextForDeal(deal, companyId, limit = 10) {
    try {
      if (!deal.ai_embedding || deal.ai_embedding.length === 0) {
        await this.generateAndStoreEmbeddingForDeal(deal);
      }

      // Find similar entities across multiple types
      const similarEntities = await this.findSimilarEntitiesAcrossTypes(
        deal.ai_embedding,
        companyId,
        limit
      );

      return similarEntities;
    } catch (error) {
      console.error("Error getting relevant context for deal:", error);
      return []; // Return empty array on error
    }
  }

  // Get relevant context for a contact
  async getRelevantContextForContact(contact, companyId, limit = 10) {
    try {
      if (!contact.ai_embedding || contact.ai_embedding.length === 0) {
        await this.generateAndStoreEmbeddingForContact(contact);
      }

      // Find similar entities across multiple types
      const similarEntities = await this.findSimilarEntitiesAcrossTypes(
        contact.ai_embedding,
        companyId,
        limit
      );

      return similarEntities;
    } catch (error) {
      console.error("Error getting relevant context for contact:", error);
      return []; // Return empty array on error
    }
  }

  // Get relevant context for an objection
  async getRelevantContextForObjection(
    objectionEmbedding,
    companyId,
    limit = 10
  ) {
    try {
      // Find similar entities across multiple types
      const similarEntities = await this.findSimilarEntitiesAcrossTypes(
        objectionEmbedding,
        companyId,
        limit
      );

      return similarEntities;
    } catch (error) {
      console.error("Error getting relevant context for objection:", error);
      return []; // Return empty array on error
    }
  }

  // Get relevant context for AI generation based on query
  async getRelevantContext(query, companyId, entityTypes = [], limit = 10) {
    try {
      // Generate embedding for the query
      const queryEmbedding = await this.generateEmbeddingForText(query);

      // Build query for entity types
      const typeFilter =
        entityTypes.length > 0 ? { entity_type: { $in: entityTypes } } : {};

      // Find similar entities across specified types
      const similarEntities = await AiEmbedding.find({
        company_id: companyId,
        ...typeFilter,
      })
        .sort({
          embedding_vector: {
            $vectorSearch: {
              queryVector: queryEmbedding,
              path: "embedding_vector",
              numCandidates: limit * 3,
              limit: limit,
            },
          },
        })
        .limit(limit);

      return similarEntities;
    } catch (error) {
      console.error("Error getting relevant context:", error);
      return []; // Return empty array on error
    }
  }

  // Get deal data for AI analysis
  async getDealDataForAnalysis(dealId, companyId) {
    try {
      const deal = await DealModel.findOne({
        _id: dealId,
        company_id: companyId,
      })
        .populate("owner_id", "name email")
        .populate("contact_ids", "name email phone")
        .populate("pipeline_id");

      if (!deal) {
        return null;
      }

      // Get activities related to this deal
      const activities = await ActivityModel.find({
        deal_id: dealId,
        company_id: companyId,
      }).sort({ created_at: -1 });

      // Get relevant context from embeddings
      const dealText = `Deal: ${deal.title}. Value: ${deal.value}. Stage: ${
        deal.stage
      }. Notes: ${deal.notes || ""}`;
      const dealEmbedding =
        deal.ai_embedding && deal.ai_embedding.length > 0
          ? deal.ai_embedding
          : await generateEmbedding(processTextForEmbedding(dealText));

      const relevantContext = await this.findSimilarEntitiesAcrossTypes(
        dealEmbedding,
        companyId,
        5
      );

      return {
        deal,
        activities,
        relevantContext,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get contact data for AI analysis
  async getContactDataForAnalysis(contactId, companyId) {
    try {
      const contact = await ContactModel.findOne({
        _id: contactId,
        company_id: companyId,
      });

      if (!contact) {
        return null;
      }

      // Get activities related to this contact
      const activities = await ActivityModel.find({
        contact_id: contactId,
        company_id: companyId,
      }).sort({ created_at: -1 });

      // Get deals related to this contact
      const deals = await DealModel.find({
        contact_ids: contactId,
        company_id: companyId,
      }).populate("pipeline_id");

      // Get relevant context from embeddings
      const contactText = `Contact: ${contact.name}. Email: ${
        contact.email
      }. Phone: ${contact.phone || ""}. Notes: ${contact.notes || ""}`;
      const contactEmbedding =
        contact.ai_embedding && contact.ai_embedding.length > 0
          ? contact.ai_embedding
          : await generateEmbedding(processTextForEmbedding(contactText));

      const relevantContext = await this.findSimilarEntitiesAcrossTypes(
        contactEmbedding,
        companyId,
        5
      );

      return {
        contact,
        activities,
        deals,
        relevantContext,
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if there's enough data for AI analysis
  async checkDataSufficiency(companyId, entityType, entityId) {
    try {
      let dataCount = 0;

      switch (entityType) {
        case "deal":
          // Count activities for the deal
          dataCount = await ActivityModel.countDocuments({
            deal_id: entityId,
            company_id: companyId,
          });
          break;
        case "contact":
          // Count activities for the contact
          dataCount = await ActivityModel.countDocuments({
            contact_id: entityId,
            company_id: companyId,
          });
          break;
        default:
          return false;
      }

      // Consider data sufficient if there are at least 3 activities
      return dataCount >= 3;
    } catch (error) {
      throw error;
    }
  }
}

export default AiRepository;
