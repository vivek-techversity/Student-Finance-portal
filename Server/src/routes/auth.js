const express = require('express');
const router = express.Router();
const { login, verifyToken, logout } = require('../controllers/authController');
const verifyTokenMiddleware = require('../middleware/verifyToken');


router.post('/login', login);

router.get('/verify', verifyTokenMiddleware, verifyToken);

// POST /api/auth/logout — cookie clear karo
router.post('/logout', logout);

module.exports = router;