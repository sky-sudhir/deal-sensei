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

// Middleware to generate embeddings on save and update
DealSchema.post("save", async function (doc) {
  try {
    const DealRepository = (await import("./deal.repository.js")).default;
    const dealRepo = new DealRepository();
    const currentDeal = await dealRepo.findDealById(doc._id);

    const embeddingData = await createEntityEmbedding(currentDeal, "deal");

    if (embeddingData?.embedding_vector) {
      try {
        // Dynamically import to avoid circular dependency
        const AiRepository = (await import("../ai/ai.repository.js")).default;
        const aiRepo = new AiRepository();

        await aiRepo.storeEmbedding(
          "deal",
          doc._id,
          doc.company_id,
          embeddingData.embedding_vector,
          embeddingData.content_summary,
          doc._id
        );
      } catch (storeError) {
        console.error(
          `Error storing embedding in central collection: ${storeError.message}`
        );
        // Don't block the flow
      }
    }
  } catch (error) {
    console.error(`Error generating embedding for deal ${doc._id}:`, error);
    // Don't throw, avoid blocking save
  }
});

// Middleware for findOneAndUpdate operations
DealSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (!doc) return;

    const embeddingData = await createEntityEmbedding(doc.toObject(), "deal");

    if (embeddingData?.embedding_vector) {
      try {
        // Dynamically import to avoid circular dependencies
        const AiRepository = (await import("../ai/ai.repository.js")).default;
        const aiRepo = new AiRepository();

        await aiRepo.storeEmbedding(
          "deal",
          doc._id,
          doc.company_id,
          embeddingData.embedding_vector,
          embeddingData.content_summary,
          doc._id
        );
      } catch (storeError) {
        console.error(
          `Error storing embedding in central collection: ${storeError.message}`
        );
      }
    }
  } catch (error) {
    console.error("Error in deal findOneAndUpdate post middleware:", error);
  }
});

const DealModel = mongoose.model("deal", DealSchema);

export { DealSchema, DealModel };
