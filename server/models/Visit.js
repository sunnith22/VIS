const mongoose = require('mongoose');

const VisitorDetailSchema = new mongoose.Schema({
  title: { type: String, default: 'Mr' },
  name: { type: String, required: true },
  designation: { type: String, default: '' },
  company: { type: String, default: '' },
  dept: { type: String, default: '' },
  visited_before: { type: Boolean, default: false },
  prev_visit_date: { type: String, default: '' }
});

const TopAttendeeSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  email: { type: String, default: '' },
  schedule: { type: mongoose.Schema.Types.Mixed, default: {} }
});

const AgendaRowSchema = new mongoose.Schema({
  sort_order: { type: Number, default: 1 },
  area: { type: String, default: '' },
  activity_name: { type: String, default: '' },
  pic: { type: String, default: '' },
  support_attendees: { type: String, default: '' },
  duration_min: { type: Number, default: 10 },
  from_time: { type: String, default: '' },
  to_time: { type: String, default: '' }
});

const VisitSchema = new mongoose.Schema({
  company_name: { type: String, default: '' },
  visit_date: { type: String, default: '' },
  visit_start: { type: String, default: '09:00' },
  visit_end: { type: String, default: '' },
  visit_advisor: { type: String, default: '' },
  visit_no: { type: String, default: '' },
  visit_purpose: { type: String, default: '' },
  status: { type: String, default: 'Draft', enum: ['Draft', 'Generated', 'Completed'] },
  review_points: { type: String, default: '' },
  photos: { type: [String], default: [] },
  completed_at: { type: Date, default: null },
  visitors: [VisitorDetailSchema],
  top_attendees: [TopAttendeeSchema],
  agenda: [AgendaRowSchema]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Helper virtual `id` mapping _id to id for seamless frontend compatibility
VisitSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

module.exports = mongoose.model('Visit', VisitSchema);
