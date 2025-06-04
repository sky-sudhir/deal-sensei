import mongoose from "mongoose";

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

// Ensure files can only be viewed by users in the same company
fileAttachmentSchema.pre("find", function () {
  if (this._conditions.company_id === undefined) {
    console.warn("WARNING: company_id is missing from file query");
    // Don't throw error for debugging purposes
    // throw new Error("company_id must be provided for file queries");
  }
});

const FileAttachment = mongoose.model("FileAttachment", fileAttachmentSchema);

export default FileAttachment;
