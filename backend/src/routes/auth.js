const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

router.post('/login', ctrl.login);
router.get('/me',     verificarToken, ctrl.me);

module.exports = router;