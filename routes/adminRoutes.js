const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');
const { isAdmin } = require('../middleware/roleMiddleware');

// Note: isAdmin middleware is already applied in index.js for this route group, 
// but we keep it here if sub-routes need specific protection or for clarity.

router.get('/', adminController.getSubAdmins);
router.post('/', adminController.createSubAdmin);
router.put('/:id', adminController.updateSubAdmin);
router.delete('/:id', adminController.deleteSubAdmin);

module.exports = router;
