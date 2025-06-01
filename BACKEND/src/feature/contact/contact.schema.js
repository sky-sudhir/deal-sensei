import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    engagement_score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    last_interaction_date: {
      type: Date,
      default: null
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'company',
      required: true
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    ai_embedding: {
      type: [Number],
      default: []
    }
  },
  {
    timestamps: { 
      createdAt: 'created_at', 
      updatedAt: 'updated_at' 
    },
    versionKey: false
  }
);

// Create indexes
ContactSchema.index({ company_id: 1 });
ContactSchema.index({ owner_id: 1 });
ContactSchema.index({ email: 1, company_id: 1 }, { unique: true, sparse: true });
ContactSchema.index({ ai_embedding: "vector" }, { background: true });

const ContactModel = mongoose.model("contact", ContactSchema);

export { ContactSchema, ContactModel };
