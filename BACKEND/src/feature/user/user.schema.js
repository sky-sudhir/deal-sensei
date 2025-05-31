import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ["admin", "sales_rep"],
      default: "sales_rep"
    },
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'company',
      required: true
    },
    is_active: {
      type: Boolean,
      default: true
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

// Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified("password")) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ company_id: 1 });
UserSchema.index({ ai_embedding: "vector" }, { background: true });

const UserModel = mongoose.model("user", UserSchema);

export { UserSchema, UserModel };
