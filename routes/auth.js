const router = require('express').Router();
const { loginLimiter } = require('../middleware/rateLimit');
const auth = require('../controllers/authController');

router.post('/login', loginLimiter, auth.login);
router.get('/me', auth.me);          // public: returns { admin: null } when logged out
router.post('/logout', auth.logout);

module.exports = router;
