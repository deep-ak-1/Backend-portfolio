const router = require('express').Router();
const { requireAdmin } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimit');
const auth = require('../controllers/authController');

router.post('/login', loginLimiter, auth.login);
router.get('/me', requireAdmin, auth.me);
router.post('/logout', auth.logout);

module.exports = router;
