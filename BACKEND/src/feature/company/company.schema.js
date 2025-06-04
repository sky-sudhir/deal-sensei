import mongoose from "mongoose";

const CompanySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    is_verified: {
      type: Boolean,
      default: false,
    },
    admin_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    settings: {
      type: Object,
      default: {},
    },
    ai_embedding: {
      type: [Number],
      default: [],
    },
    company_id: {
      type: String,
      default: function () {
        return this._id;
      },
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
CompanySchema.index({ email: 1 });

const CompanyModel = mongoose.model("company", CompanySchema);

export { CompanySchema, CompanyModel };
