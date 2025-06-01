import mongoose from "mongoose";

const DealSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    stage: {
      type: String,
      required: true,
      trim: true
    },
    pipeline_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'pipeline',
      required: true
    },
    contact_ids: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'contact'
    }],
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true
    },
    status: {
      type: String,
      enum: ['open', 'won', 'lost'],
      default: 'open'
    },
    close_date: {
      type: Date,
      default: null
    },
    stage_duration_days: {
      type: Number,
      default: 0
    },
    total_deal_duration_days: {
      type: Number,
      default: 0
    },
    notes: {
      type: String,
      trim: true
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'company',
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
DealSchema.index({ company_id: 1 });
DealSchema.index({ owner_id: 1 });
DealSchema.index({ pipeline_id: 1 });
DealSchema.index({ status: 1, company_id: 1 });
DealSchema.index({ ai_embedding: "vector" }, { background: true });

const DealModel = mongoose.model("deal", DealSchema);

export { DealSchema, DealModel };
