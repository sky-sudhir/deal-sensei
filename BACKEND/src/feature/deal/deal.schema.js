import mongoose from "mongoose";
import { createEntityEmbedding } from "../../utils/aiUtils.js";

const DealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
    },
    stage: {
      type: String,
      required: true,
      trim: true,
    },
    pipeline_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "pipeline",
      required: true,
    },
    contact_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "contact",
      },
    ],
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "won", "lost"],
      default: "open",
    },
    close_date: {
      type: Date,
      default: null,
    },
    stage_duration_days: {
      type: Number,
      default: 0,
    },
    total_deal_duration_days: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    ai_embedding: {
      type: [Number],
      default: [],
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    versionKey: false,
  }
);

// Create indexes
DealSchema.index({ company_id: 1 });
DealSchema.index({ owner_id: 1 });
DealSchema.index({ pipeline_id: 1 });
DealSchema.index({ status: 1, company_id: 1 });
DealSchema.index({ ai_embedding: "vector" }, { background: true });

// Middleware to generate embeddings on save and update
DealSchema.pre("save", async function (next) {
  try {
    // Only generate embedding if document is new or title/notes/value/stage has changed
    if (
      this.isNew ||
      this.isModified("title") ||
      this.isModified("notes") ||
      this.isModified("value") ||
      this.isModified("stage")
    ) {
      console.log(`Generating embedding for deal ${this._id}`);
      const embeddingData = await createEntityEmbedding(this, "deal");
      if (embeddingData && embeddingData.embedding_vector) {
        this.ai_embedding = embeddingData.embedding_vector;
        
        // Also store in the central AI embeddings collection
        // Only if we have an _id (for new documents)
        if (this._id) {
          try {
            // Import dynamically to avoid circular dependency
            const AiRepository = (await import("../ai/ai.repository.js")).default;
            const aiRepo = new AiRepository();
            
            await aiRepo.storeEmbedding(
              "deal",
              this._id,
              this.company_id,
              embeddingData.embedding_vector,
              embeddingData.content_summary
            );
          } catch (storeError) {
            console.error(`Error storing embedding in central collection: ${storeError.message}`);
            // Continue even if central storage fails
          }
        }
      }
    }
    next();
  } catch (error) {
    console.error(`Error generating embedding for deal ${this._id}:`, error);
    // Continue saving even if embedding generation fails
    next();
  }
});

// Middleware for findOneAndUpdate operations
DealSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    const dealId = this.getQuery()._id;

    // Check if relevant fields are being updated
    if (update.title || update.notes || update.value || update.stage) {
      // Get the updated document
      const deal = await this.model.findOne(this.getQuery());
      if (!deal) return next();

      // Apply updates to the document (for embedding generation)
      if (update.title) deal.title = update.title;
      if (update.notes) deal.notes = update.notes;
      if (update.value) deal.value = update.value;
      if (update.stage) deal.stage = update.stage;

      console.log(`Generating embedding for updated deal ${dealId}`);
      const embeddingData = await createEntityEmbedding(deal, "deal");
      if (embeddingData && embeddingData.embedding_vector) {
        // Add the embedding to the update operation
        this.setUpdate({
          ...update,
          ai_embedding: embeddingData.embedding_vector,
        });
        
        // Also store in the central AI embeddings collection
        try {
          // Import dynamically to avoid circular dependency
          const AiRepository = (await import("../ai/ai.repository.js")).default;
          const aiRepo = new AiRepository();
          
          await aiRepo.storeEmbedding(
            "deal",
            dealId,
            deal.company_id,
            embeddingData.embedding_vector,
            embeddingData.content_summary
          );
        } catch (storeError) {
          console.error(`Error storing embedding in central collection: ${storeError.message}`);
          // Continue even if central storage fails
        }
      }
    }
    next();
  } catch (error) {
    console.error("Error in deal findOneAndUpdate middleware:", error);
    next();
  }
});

const DealModel = mongoose.model("deal", DealSchema);

export { DealSchema, DealModel };
