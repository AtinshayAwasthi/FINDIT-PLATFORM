
const express = require('express');
const { 
  createItemRequest, 
  getItemRequests, 
  updateRequestStatus 
} = require('../controllers/requestController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.post('/', createItemRequest);

// Protected routes
router.get('/item/:itemId', protect, getItemRequests);
router.put('/:requestId', protect, updateRequestStatus);

module.exports = router;
