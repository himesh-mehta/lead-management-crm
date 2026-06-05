const express = require('express');
const router = express.Router();
const { signUp, signIn, demoLogin } = require('../controllers/authController');

// Mounted at /api/auth
router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/demo', demoLogin);

module.exports = router;

