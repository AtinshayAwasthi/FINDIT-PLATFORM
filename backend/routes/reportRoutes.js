
const express = require('express');
const { 
  createItemReport, 
  getReports, 
  updateReportStatus 
} = require('../controllers/reportController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/', createItemReport);

// Protected routes (ideally admin-only)
router.get('/', protect, getReports);
router.put('/:reportId', protect, updateReportStatus);

module.exports = router;
