const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./auth');
const profileRoutes = require('./profile');
const { makeCrudRouter } = require('./crud');
const Project = require('../models/Project');
const Skill = require('../models/Skill');
const Experience = require('../models/Experience');
const { projectSanitizer, skillSanitizer, experienceSanitizer } = require('../utils/sanitize');

const router = express.Router();
const DB_STATES = ['disconnected', 'connected', 'connecting', 'disconnecting'];

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'portfolio-api',
    database: DB_STATES[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/projects', makeCrudRouter({
  Model: Project,
  sanitize: projectSanitizer,
  sort: { featured: -1, order: 1, createdAt: -1 },
}));
router.use('/skills', makeCrudRouter({
  Model: Skill,
  sanitize: skillSanitizer,
  sort: { category: 1, name: 1 },
}));
router.use('/experience', makeCrudRouter({
  Model: Experience,
  sanitize: experienceSanitizer,
  sort: { type: 1, startDate: -1 },
}));

module.exports = router;
