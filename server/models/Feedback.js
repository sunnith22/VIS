const mongoose = require('mongoose');

const FeedbackItemSchema = new mongoose.Schema({
  feedback: { type: String, default: '' },
  from: { type: String, default: '' }
});

const FeedbackSchema = new mongoose.Schema({
  company: { type: String, required: true },
  visit_date: { type: String, default: '' },
  visit_time: { type: String, default: '' },
  visit_purpose: { type: String, default: '' },
  visitors: { type: Array, default: [] },
  feedback_rows: [FeedbackItemSchema],
  submitted_at: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

FeedbackSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
