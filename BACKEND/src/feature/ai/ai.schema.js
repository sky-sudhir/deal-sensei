import mongoose from "mongoose";

// This schema is for storing AI embedding vectors and related metadata
const aiEmbeddingSchema = new mongoose.Schema(
  {
    entity_type: {
      type: String,
      required: true,
      enum: ["deal", "contact", "activity", "file", "email_template", "objection"],
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Company",
    },
    embedding_vector: {
      type: [Number],
      required: true,
    },
    content_summary: {
      type: String,
      required: true,
    },
    last_updated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Create a compound index for efficient lookups
aiEmbeddingSchema.index({ entity_type: 1, entity_id: 1 }, { unique: true });
// Create a company index for filtering
aiEmbeddingSchema.index({ company_id: 1 });
// Create a vector index for similarity search
aiEmbeddingSchema.index({ embedding_vector: "vector" });

const AiEmbedding = mongoose.model("AiEmbedding", aiEmbeddingSchema);

export default AiEmbedding;
