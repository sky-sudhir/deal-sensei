import mongoose from "mongoose";
import { createEntityEmbedding } from "../../utils/aiUtils.js";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    engagement_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    last_interaction_date: {
      type: Date,
      default: null,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
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
ContactSchema.index({ company_id: 1 });
ContactSchema.index({ owner_id: 1 });

// Middleware to generate embeddings on save and update
ContactSchema.post("save", async function (doc) {
  try {
    const embeddingData = await createEntityEmbedding(doc, "contact");
    if (embeddingData?.embedding_vector) {
      try {
        const AiRepository = (await import("../ai/ai.repository.js")).default;
        const aiRepo = new AiRepository();

        await aiRepo.storeEmbedding(
          "contact",
          doc._id,
          doc.company_id,
          embeddingData.embedding_vector,
          embeddingData.content_summary,
          null,
          doc._id
        );
      } catch (storeError) {
        console.error(
          `Error storing embedding in central collection: ${storeError.message}`
        );
      }
    }
  } catch (error) {
    console.error(`Error generating embedding for contact ${doc._id}:`, error);
  }
});

// Middleware for findOneAndUpdate operations
ContactSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (!doc) return;

    const contactId = doc._id;

    const embeddingData = await createEntityEmbedding(
      doc.toObject(),
      "contact"
    );

    if (embeddingData?.embedding_vector) {
      try {
        const AiRepository = (await import("../ai/ai.repository.js")).default;
        const aiRepo = new AiRepository();

        await aiRepo.storeEmbedding(
          "contact",
          contactId,
          doc.company_id,
          embeddingData.embedding_vector,
          embeddingData.content_summary,
          null,
          contactId
        );
      } catch (storeError) {
        console.error(
          `Error storing contact embedding in central collection: ${storeError.message}`
        );
      }
    }
  } catch (error) {
    console.error("Error in contact findOneAndUpdate post middleware:", error);
  }
});

const ContactModel = mongoose.model("contact", ContactSchema);

export { ContactSchema, ContactModel };
