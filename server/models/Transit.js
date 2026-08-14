const mongoose = require('mongoose');

const TransitSchema = new mongoose.Schema({
  label: { type: String, required: true },
  pic: { type: String, default: '' },
  min: { type: Number, default: 5 }
}, { timestamps: true });

module.exports = mongoose.model('Transit', TransitSchema);
