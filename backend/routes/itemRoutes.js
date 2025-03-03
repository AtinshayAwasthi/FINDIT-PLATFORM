
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
  createItem,
  getItems,
  getItem,
  updateItem,
  deleteItem,
  getRecentItems,
  getUserItems
} = require('../controllers/itemController');
const { protect } = require('../middlewares/authMiddleware');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Public routes
router.get('/', getItems);
router.get('/recent', getRecentItems);
router.get('/:id', getItem);

// Protected routes
router.post('/', protect, upload.single('image'), createItem);
router.put('/:id', protect, upload.single('image'), updateItem);
router.delete('/:id', protect, deleteItem);
router.get('/user/:type', protect, getUserItems);

module.exports = router;
