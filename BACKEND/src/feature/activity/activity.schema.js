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
ActivitySchema.index({ deal_id: 1, created_at: -1 });
ActivitySchema.index({ contact_id: 1, created_at: -1 });
ActivitySchema.index({ user_id: 1, created_at: -1 });
ActivitySchema.index({ ai_embedding: "vector" }, { background: true });

// Middleware to generate embeddings on save and update
ActivitySchema.pre("save", async function (next) {
  try {
    // Only generate embedding if document is new or relevant fields have changed
    if (
      this.isNew ||
      this.isModified("content") ||
      this.isModified("subject") ||
      this.isModified("type") ||
      this.isModified("next_steps")
    ) {
      console.log(`Generating embedding for activity ${this._id}`);
      const embeddingData = await createEntityEmbedding(this, "activity");
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
              "activity",
              this._id,
              this.company_id,
              embeddingData.embedding_vector,
              embeddingData.content_summary
            );
          } catch (storeError) {
            console.error(
              `Error storing embedding in central collection: ${storeError.message}`
            );
            // Continue even if central storage fails
          }
        }
      }
    }
    next();
  } catch (error) {
    console.error(
      `Error generating embedding for activity ${this._id}:`,
      error
    );
    // Continue saving even if embedding generation fails
    next();
  }
});

// Middleware for findOneAndUpdate operations
ActivitySchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    const activityId = this.getQuery()._id;

    // Check if relevant fields are being updated
    if (update.content || update.subject || update.type || update.next_steps) {
      // Get the updated document
      const activity = await this.model.findOne(this.getQuery());
      if (!activity) return next();

      // Apply updates to the document (for embedding generation)
      if (update.content) activity.content = update.content;
      if (update.subject) activity.subject = update.subject;
      if (update.type) activity.type = update.type;
      if (update.next_steps) activity.next_steps = update.next_steps;

      console.log(`Generating embedding for updated activity ${activityId}`);
      const embeddingData = await createEntityEmbedding(activity, "activity");
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
            "activity",
            activityId,
            activity.company_id,
            embeddingData.embedding_vector,
            embeddingData.content_summary
          );
        } catch (storeError) {
          console.error(
            `Error storing embedding in central collection: ${storeError.message}`
          );
          // Continue even if central storage fails
        }
      }
    }
    next();
  } catch (error) {
    console.error("Error in activity findOneAndUpdate middleware:", error);
    next();
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
