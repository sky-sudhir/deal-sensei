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
ContactSchema.index(
  { email: 1, company_id: 1 },
  { unique: true, sparse: true }
);
ContactSchema.index({ ai_embedding: "vector" }, { background: true });

// Middleware to generate embeddings on save and update
ContactSchema.pre("save", async function (next) {
  try {
    // Only generate embedding if document is new or relevant fields have changed
    if (
      this.isNew ||
      this.isModified("name") ||
      this.isModified("email") ||
      this.isModified("phone") ||
      this.isModified("notes")
    ) {
      console.log(`Generating embedding for contact ${this._id}`);
      const embeddingData = await createEntityEmbedding(this, "contact");
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
              "contact",
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
    console.error(`Error generating embedding for contact ${this._id}:`, error);
    // Continue saving even if embedding generation fails
    next();
  }
});

// Middleware for findOneAndUpdate operations
ContactSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const update = this.getUpdate();
    const contactId = this.getQuery()._id;

    // Check if relevant fields are being updated
    if (update.name || update.email || update.phone || update.notes) {
      // Get the updated document
      const contact = await this.model.findOne(this.getQuery());
      if (!contact) return next();

      // Apply updates to the document (for embedding generation)
      if (update.name) contact.name = update.name;
      if (update.email) contact.email = update.email;
      if (update.phone) contact.phone = update.phone;
      if (update.notes) contact.notes = update.notes;

      console.log(`Generating embedding for updated contact ${contactId}`);
      const embeddingData = await createEntityEmbedding(contact, "contact");
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
            "contact",
            contactId,
            contact.company_id,
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
    console.error("Error in contact findOneAndUpdate middleware:", error);
    next();
  }
});

const ContactModel = mongoose.model("contact", ContactSchema);

export { ContactSchema, ContactModel };
