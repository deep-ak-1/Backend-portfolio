const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    category: { type: String, default: 'General', trim: true, maxlength: 60 },
    level: { type: Number, min: 0, max: 100, default: null },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Skill', skillSchema);
