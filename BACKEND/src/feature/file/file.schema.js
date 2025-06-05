import mongoose from "mongoose";
import { createEntityEmbedding } from "../../utils/aiUtils.js";

const fileAttachmentSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
      trim: true,
    },
    original_filename: {
      type: String,
      required: true,
      trim: true,
    },
    file_type: {
      type: String,
      required: true,
    },
    file_size_bytes: {
      type: Number,
      required: true,
    },
    s3_key: {
      type: String,
      required: true,
    },
    s3_url: {
      type: String,
      required: true,
    },
    attached_to_type: {
      type: String,
      enum: ["deal", "contact", "activity", "general"],
      default: "general",
    },
    attached_to_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "attached_to_type",
      required: function () {
        return this.attached_to_type !== "general";
      },
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
    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
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
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// Index for company_id and created_at for efficient queries
fileAttachmentSchema.index({ company_id: 1, created_at: -1 });

fileAttachmentSchema.post("save", async function (doc) {
  if (!doc) return;
  try {
    const FileAttachmentRepository = (await import("./file.repository.js"))
      .default;
    const fileAttachmentRepo = new FileAttachmentRepository();
    const currentFileAttachment =
      await fileAttachmentRepo.getFileAttachmentById(doc._id);
    const embeddingData = await createEntityEmbedding(
      currentFileAttachment,
      "file"
    );
    if (embeddingData && embeddingData.embedding_vector) {
      // Store in the central AI embeddings collection
      try {
        const AiRepository = (await import("../ai/ai.repository.js")).default;
        const aiRepo = new AiRepository();

        await aiRepo.storeEmbedding(
          "file",
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
    console.error("Error generating embeddings for file attachment:", error);
  }
});

const FileAttachment = mongoose.model("FileAttachment", fileAttachmentSchema);

export default FileAttachment;
