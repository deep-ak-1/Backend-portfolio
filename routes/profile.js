const router = require('express').Router();
const { requireAdmin } = require('../middleware/auth');
const profile = require('../controllers/profileController');

router.get('/', profile.getProfile);
router.put('/', requireAdmin, profile.updateProfile);

module.exports = router;
