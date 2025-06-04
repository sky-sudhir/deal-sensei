import mongoose from "mongoose";
import { createEntityEmbedding } from "../../utils/aiUtils.js";

const MessageSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "company",
      required: true,
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

    message_user: {
      type: String,
      required: true,
      trim: true,
    },
    message_assistant: {
      type: String,
      required: true,
      trim: true,
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

// MessageSchema.post("save", async function (doc) {
//   try {
//     const embeddingData = await createEntityEmbedding(doc, "message");

//     if (embeddingData?.embedding_vector) {
//       try {
//         const AiRepository = (await import("../ai/ai.repository.js")).default;
//         const aiRepo = new AiRepository();

//         await aiRepo.storeEmbedding(
//           "message",
//           doc._id,
//           doc.company_id,
//           embeddingData.embedding_vector,
//           embeddingData.content_summary,
//           doc.deal_id,
//           doc.contact_id
//         );
//       } catch (error) {
//         console.error("Error storing embedding:", error);
//       }
//     }
//   } catch (error) {
//     console.error("Error generating embedding:", error);
//   }
// });

const MessageModel = mongoose.model("message", MessageSchema);

MessageSchema.index({ company_id: 1 });

export { MessageSchema, MessageModel };
