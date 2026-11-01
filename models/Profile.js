const mongoose = require('mongoose');

// Single-document collection: always addressed by key "main".
const profileSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'main', unique: true },
    fullName: { type: String, default: 'Your Name', trim: true, maxlength: 120 },
    title: { type: String, default: 'MERN STACK DEVELOPER', trim: true, maxlength: 120 },
    bio: { type: String, default: '', maxlength: 3000 },
    introduction: { type: String, default: '', maxlength: 500 },
    email: { type: String, default: '', trim: true, maxlength: 254 },
    photoUrl: { type: String, default: '/images/profile.jpg' },
    resumeUrl: { type: String, default: '' },
    socials: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Profile', profileSchema);
