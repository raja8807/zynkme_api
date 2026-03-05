const express = require('express');
const router = express.Router();

const authenticate = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

router.get('/health', (req, res) => {
    res.json({ message: 'Healthy' });
});

router.use('/auth', require('./authRoutes'));
router.use('/profile', require('./profileRoutes'));
router.use('/admins', authenticate, isAdmin, require('./adminRoutes'));
router.use('/notifications', require('./notificationRoutes'));

module.exports = router;
