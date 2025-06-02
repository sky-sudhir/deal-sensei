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
          contact_id: contactId
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
      // Use aggregation pipeline with $search stage for vector search
      const results = await AiEmbedding.aggregate([
        {
          $search: {
            vectorSearch: {
              queryVector: embeddingVector,
              path: "embedding_vector",
              numCandidates: limit * 3, // Fetch more candidates for better results
              limit: limit
            },
            filter: {
              compound: {
                must: [
                  { equals: { path: "company_id", value: companyId } },
                  { equals: { path: "entity_type", value: entityType } }
                ]
              }
            }
          }
        },
        { $limit: limit }
      ]);
      
      // Populate entity_id if needed
      // Since aggregation doesn't support populate directly, we need to do it manually
      // or use a $lookup stage in the aggregation pipeline
      
      return results;
    } catch (error) {
      console.error("Vector search error:", error);
      // Fallback to regular find if vector search fails
      return await AiEmbedding.find({
        company_id: companyId,
        entity_type: entityType
      }).limit(limit);
    }
  }

  // Find similar entities across multiple entity types
  async findSimilarEntitiesAcrossTypes(embeddingVector, companyId, limit = 10, dealId = null, contactId = null) {
    try {
      // Build filter conditions
      let filterConditions = [
        { equals: { path: "company_id", value: companyId } }
      ];

      // Add deal_id filter if provided
      if (dealId) {
        filterConditions.push({ equals: { path: "deal_id", value: dealId } });
      }

      // Add contact_id filter if provided
      if (contactId) {
        filterConditions.push({ equals: { path: "contact_id", value: contactId } });
      }

      // Use $vectorSearch operator with enhanced filter syntax
      const aggregation = [
        {
          $search: {
            vectorSearch: {
              queryVector: embeddingVector,
              path: "embedding_vector",
              numCandidates: limit * 3,
              limit: limit * 2 // Get more candidates to allow for scoring
            },
            filter: filterConditions.length > 1 ? 
              { compound: { should: filterConditions } } : 
              { equals: { path: "company_id", value: companyId } }
          }
        }
      ];

      // Add scoring based on deal_id and contact_id matches
      if (dealId || contactId) {
        aggregation.push({
          $addFields: {
            relevanceScore: {
              $add: [
                { $multiply: [{ $meta: "searchScore" }, 10] }, // Base vector similarity score
                { $cond: [{ $eq: ["$deal_id", dealId] }, 50, 0] }, // Bonus for matching deal
                { $cond: [{ $eq: ["$contact_id", contactId] }, 50, 0] } // Bonus for matching contact
              ]
            }
          }
        });
        aggregation.push({ $sort: { relevanceScore: -1 } });
      }

      // Limit results
      aggregation.push({ $limit: limit });

      return await AiEmbedding.aggregate(aggregation);
    } catch (error) {
      console.error("Vector search error:", error);
      // Fallback to regular find if vector search fails
      const query = { company_id: companyId };
      
      // Add deal_id and contact_id to query if provided
      if (dealId) query.$or = [{ deal_id: dealId }, { deal_id: null }];
      if (contactId) {
        if (query.$or) {
          query.$or.push({ contact_id: contactId }, { contact_id: null });
        } else {
          query.$or = [{ contact_id: contactId }, { contact_id: null }];
        }
      }
      
      return await AiEmbedding.find(query).limit(limit);
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
      // Generate embedding data
      const embeddingData = await createEntityEmbedding(entity, entityType);
      
      if (!embeddingData) {
        console.error(`Failed to create embedding for ${entityType} ${entity._id}`);
        return null;
      }
      
      // Check if the entity already has the same embedding
      if (entity.ai_embedding && 
          entity.ai_embedding.length === embeddingData.embedding_vector.length &&
          JSON.stringify(entity.ai_embedding) === JSON.stringify(embeddingData.embedding_vector)) {
        console.log(`Embedding already exists and is identical for ${entityType} ${entity._id}`);
        
        // Still store in AI embeddings collection to ensure consistency
        await this.storeEmbedding(
          entityType,
          entity._id,
          entity.company_id,
          embeddingData.embedding_vector,
          embeddingData.content_summary
        );
        
        return embeddingData.embedding_vector;
      }
      
      // Determine the model based on entity type
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
          throw new Error(`Unsupported entity type: ${entityType}`);
      }
      
      // Update the entity with the embedding vector if needed
      // Note: This might be redundant with schema-level hooks, but ensures consistency
      if (!entity.ai_embedding || entity.ai_embedding.length === 0 || 
          JSON.stringify(entity.ai_embedding) !== JSON.stringify(embeddingData.embedding_vector)) {
        await model.findByIdAndUpdate(entity._id, { 
          ai_embedding: embeddingData.embedding_vector 
        });
      }
      
      // Store in AI embeddings collection with deal_id or contact_id if applicable
      let dealId = null;
      let contactId = null;
      
      // Set the appropriate ID based on entity type
      if (entityType === "deal") {
        dealId = entity._id;
      } else if (entityType === "contact") {
        contactId = entity._id;
      }
      
      await this.storeEmbedding(
        entityType,
        entity._id,
        entity.company_id,
        embeddingData.embedding_vector,
        embeddingData.content_summary,
        dealId,
        contactId
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
      const batchSize = 10; // Process in smaller batches to avoid overwhelming the system
      
      // Process entities in batches
      for (let i = 0; i < entities.length; i += batchSize) {
        const batch = entities.slice(i, i + batchSize);
        const batchPromises = batch.map(async (entity) => {
          try {
            // Generate embedding data
            const embeddingData = await createEntityEmbedding(entity, entityType);
            
            if (!embeddingData || !embeddingData.embedding_vector) {
              return {
                id: entity._id,
                success: false,
                error: "Failed to generate embedding data"
              };
            }
            
            // Update the entity with the embedding to trigger schema hooks
            entity.ai_embedding = embeddingData.embedding_vector;
            await entity.save();
            
            // Also store in AI embeddings collection
            await this.storeEmbedding(
              entityType,
              entity._id,
              entity.company_id,
              embeddingData.embedding_vector,
              embeddingData.content_summary
            );
            
            return {
              id: entity._id,
              success: true
            };
          } catch (error) {
            console.error(`Error processing ${entityType} ${entity._id}:`, error);
            return {
              id: entity._id,
              success: false,
              error: error.message
            };
          }
        });
        
        // Wait for the current batch to complete
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
      }
      
      return {
        total: entities.length,
        processed: results.length,
        success: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results
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

      // Find similar entities across multiple types, passing the deal_id
      const similarEntities = await this.findSimilarEntitiesAcrossTypes(
        deal.ai_embedding,
        companyId,
        limit,
        deal._id, // Pass the deal_id
        null      // No contact_id for deal context
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

      // Find similar entities across multiple types, passing the contact_id
      const similarEntities = await this.findSimilarEntitiesAcrossTypes(
        contact.ai_embedding,
        companyId,
        limit,
        null,       // No deal_id for contact context
        contact._id // Pass the contact_id
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

      // Use aggregation pipeline with $search stage for vector search
      let pipeline = [
        {
          $search: {
            vectorSearch: {
              queryVector: queryEmbedding,
              path: "embedding_vector",
              numCandidates: limit * 3,
              limit: limit
            },
            filter: {
              equals: { path: "company_id", value: companyId }
            }
          }
        }
      ];
      
      // Add entity type filter if specified
      if (entityTypes.length > 0) {
        pipeline.push({
          $match: { entity_type: { $in: entityTypes } }
        });
      }
      
      // Add limit
      pipeline.push({ $limit: limit });
      
      // Execute the aggregation
      const similarEntities = await AiEmbedding.aggregate(pipeline);

      return similarEntities;
    } catch (error) {
      console.error("Error getting relevant context:", error);
      // Fallback to regular find if vector search fails
      try {
        const fallbackQuery = { company_id: companyId };
        if (entityTypes.length > 0) {
          fallbackQuery.entity_type = { $in: entityTypes };
        }
        return await AiEmbedding.find(fallbackQuery).limit(limit);
      } catch (fallbackError) {
        console.error("Fallback query failed:", fallbackError);
        return []; // Return empty array on error
      }
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
