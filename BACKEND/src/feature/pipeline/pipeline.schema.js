import mongoose from "mongoose";

const PipelineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    stages: {
      type: [
        {
          name: {
            type: String,
            required: true,
            trim: true,
          },
          order: {
            type: Number,
            required: true,
          },
          win_probability: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
          },
        },
      ],
      required: true,
      validate: [
        {
          validator: function (stages) {
            return stages.length >= 2; // At least 2 stages required
          },
          message: "Pipeline must have at least 2 stages",
        },
      ],
    },
    is_default: {
      type: Boolean,
      default: false,
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
PipelineSchema.index({ company_id: 1 });

const PipelineModel = mongoose.model("pipeline", PipelineSchema);

export { PipelineSchema, PipelineModel };
