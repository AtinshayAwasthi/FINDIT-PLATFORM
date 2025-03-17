
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
const { createRequest, getItemRequests } = require('../controllers/requestController');
const { createReport } = require('../controllers/reportController');
const { getContactInfo } = require('../controllers/contactController');
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

// Item request routes
router.post('/:id/request', protect, createRequest);
router.get('/:id/requests', protect, getItemRequests);

// Item report route
router.post('/:id/report', createReport);

// Item contact route
router.get('/:id/contact', protect, getContactInfo);

module.exports = router;
