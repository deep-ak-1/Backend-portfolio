const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['experience', 'education'], default: 'experience' },
    organization: { type: String, required: true, trim: true, maxlength: 120 },
    role: { type: String, required: true, trim: true, maxlength: 120 },
    startDate: { type: String, default: '', maxlength: 40 },
    endDate: { type: String, default: '', maxlength: 40 },
    current: { type: Boolean, default: false },
    description: { type: String, default: '', maxlength: 2000 },
    published: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Experience', experienceSchema);
