
const express = require('express');
const { 
  getItems, 
  getRecentItems,
  getUserItems,
  getItemById, 
  createItem, 
  updateItem, 
  deleteItem 
} = require('../controllers/itemController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getItems);
router.get('/recent', getRecentItems);
router.get('/:id', getItemById);

// Protected routes
router.get('/user/:type', protect, getUserItems);
router.post('/', protect, upload.single('image'), createItem);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);

// Item request, report, and contact endpoints
router.post('/:id/request', protect, (req, res) => {
  res.status(200).json({ message: 'Request submitted successfully' });
});

router.post('/:id/report', (req, res) => {
  res.status(200).json({ message: 'Report submitted successfully' });
});

router.get('/:id/contact', protect, (req, res) => {
  // In a real app, this would fetch the actual contact info from the database
  // For now, return dummy data for demonstration
  res.status(200).json({
    phone: '555-123-4567',
    email: 'contact@example.com'
  });
});

module.exports = router;
