
const express = require('express');
const multer = require('multer');
const path = require('path');
const { 
  getItems, 
  getItem, 
  createItem, 
  updateItem, 
  deleteItem,
  itemPhotoUpload
} = require('../controllers/itemController');
const { protect } = require('../middlewares/authMiddleware');

// Set up multer for file uploads
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

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Error: Images Only! (jpeg, jpg, png, webp)'));
  }
});

const router = express.Router();

router.route('/')
  .get(getItems)
  .post(protect, upload.single('image'), createItem);

router.route('/:id')
  .get(getItem)
  .put(protect, upload.single('image'), updateItem)
  .delete(protect, deleteItem);

router.route('/:id/photo')
  .put(protect, upload.single('image'), itemPhotoUpload);

module.exports = router;
