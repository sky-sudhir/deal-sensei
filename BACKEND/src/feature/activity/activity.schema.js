import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['call', 'email', 'meeting', 'note', 'task'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  duration_minutes: {
    type: Number,
    default: 0
  },
  sentiment_score: {
    type: Number,
    min: -1,
    max: 1,
    default: 0
  },
  objections_mentioned: {
    type: [String],
    default: []
  },
  next_steps: {
    type: String,
    default: ''
  },
  deal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'deal',
    required: false
  },
  contact_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'contact',
    required: false
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  ai_embedding: {
    type: [Number],
    default: []
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Index for company_id and created_at for efficient queries
ActivitySchema.index({ company_id: 1, created_at: -1 });

// Index for contact_id and created_at
ActivitySchema.index({ contact_id: 1, created_at: -1 });

// Index for deal_id and created_at
ActivitySchema.index({ deal_id: 1, created_at: -1 });

// Index for user_id and created_at
ActivitySchema.index({ user_id: 1, created_at: -1 });

// Ensure activities can only be viewed by users in the same company
ActivitySchema.pre('find', function() {
  if (this._conditions.company_id === undefined) {
    throw new Error('company_id must be provided for activity queries');
  }
});

export const ActivityModel = mongoose.model('Activity', ActivitySchema);
export default ActivitySchema;
