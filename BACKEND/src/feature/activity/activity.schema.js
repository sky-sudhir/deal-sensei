import mongoose from "mongoose";
import { createEntityEmbedding } from "../../utils/aiUtils.js";

const ActivitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["call", "email", "meeting", "note", "task"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    duration_minutes: {
      type: Number,
      default: 0,
    },
    sentiment_score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0,
    },
    objections_mentioned: {
      type: [String],
      default: [],
    },
    next_steps: {
      type: String,
      default: "",
    },
    deal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "deal",
      required: false,
    },
    contact_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "contact",
      required: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    ai_embedding: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Index for company_id and created_at for efficient queries
ActivitySchema.index({ company_id: 1, created_at: -1 });
// Middleware to generate embeddings on save and update
ActivitySchema.post("save", async function (doc) {
  if (!doc) return;
  try {
    const ActivityRepository = (await import("./activity.repository.js"))
      .default;
    const activityRepo = new ActivityRepository();
    const currentActivity = await activityRepo.getActivityById(
      doc._id,
      doc.company_id
    );
    const embeddingData = await createEntityEmbedding(
      currentActivity,
      "activity"
    );

    if (embeddingData && embeddingData.embedding_vector) {
      // Store in the central AI embeddings collection
      try {
        const AiRepository = (await import("../ai/ai.repository.js")).default;
        const aiRepo = new AiRepository();

        await aiRepo.storeEmbedding(
          "activity",
          doc._id,
          doc.company_id,
          embeddingData.embedding_vector,
          embeddingData.content_summary,
          doc.deal_id,
          doc.contact_id
        );
      } catch (storeError) {
        console.error(
          `Error storing embedding in central collection: ${storeError.message}`
        );
      }
    }
  } catch (error) {
    console.error(`Error generating embedding for activity ${doc._id}:`, error);
  }
});

// Middleware for findOneAndUpdate operations
ActivitySchema.post("findOneAndUpdate", async function (doc) {
  if (!doc) return;
  try {
    const embeddingData = await createEntityEmbedding(doc, "activity");

    if (embeddingData && embeddingData.embedding_vector) {
      try {
        const AiRepository = (await import("../ai/ai.repository.js")).default;
        const aiRepo = new AiRepository();

        const res = await aiRepo.storeEmbedding(
          "activity",
          doc._id,
          doc.company_id,
          embeddingData.embedding_vector,
          embeddingData.content_summary,
          doc.deal_id,
          doc.contact_id
        );
      } catch (storeError) {
        console.error(
          `Error storing embedding in central collection: ${storeError.message}`
        );
      }
    }
  } catch (error) {
    console.error("Error in activity findOneAndUpdate post middleware:", error);
  }
});

// Ensure activities can only be viewed by users in the same company
ActivitySchema.pre("find", function () {
  if (this._conditions.company_id === undefined) {
    throw new Error("company_id must be provided for activity queries");
  }
});

export const ActivityModel = mongoose.model("Activity", ActivitySchema);
export default ActivitySchema;
