const mongoose = require('mongoose');

const SubAreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pic: { type: String, default: '' },
  min: { type: Number, default: 10 },
  order: { type: Number, default: 1 }
});

const AreaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: { type: String, default: '🏢' },
  color: { type: String, default: '#1565C0' },
  order: { type: Number, default: 1 },
  subs: [SubAreaSchema]
}, { timestamps: true });

module.exports = mongoose.model('Area', AreaSchema);
