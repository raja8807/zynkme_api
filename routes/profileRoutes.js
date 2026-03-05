const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticate = require('../middleware/authMiddleware');

router.post('/update', authenticate, profileController.updateProfile);
router.get('/me', authenticate, profileController.getMyProfile);

module.exports = router;
