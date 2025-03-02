
const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');

// @desc    Create new item
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Handle image upload
    if (req.file) {
      req.body.image = `/uploads/${req.file.filename}`;
    }
    
    const item = await Item.create(req.body);

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items
// @route   GET /api/items
// @access  Public
exports.getItems = async (req, res, next) => {
  try {
    // Extract query parameters
    const { type, category, search } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by type if provided
    if (type && ['lost', 'found'].includes(type)) {
      query.type = type;
    }
    
    // Filter by category if provided
    if (category) {
      query.category = category;
    }
    
    // Search in title and description if search term provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await Item.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent items
// @route   GET /api/items/recent
// @access  Public
exports.getRecentItems = async (req, res, next) => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .limit(6);
      
    // Transform for frontend
    const transformedItems = items.map(item => ({
      id: item._id,
      title: item.title,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date.toLocaleDateString(),
      category: item.category,
      image: item.image ? `http://localhost:5000${item.image}` : undefined
    }));

    res.status(200).json(transformedItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's items
// @route   GET /api/items/user/:type
// @access  Private
exports.getUserItems = async (req, res, next) => {
  try {
    const { type } = req.params;
    
    if (!['lost', 'found'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type'
      });
    }
    
    const items = await Item.find({ 
      user: req.user.id,
      type
    }).sort({ createdAt: -1 });
    
    // Transform for frontend
    const transformedItems = items.map(item => ({
      id: item._id,
      title: item.title,
      description: item.description,
      type: item.type,
      location: item.location,
      date: item.date.toLocaleDateString(),
      category: item.category,
      image: item.image ? `http://localhost:5000${item.image}` : undefined
    }));

    res.status(200).json(transformedItems);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public
exports.getItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('user', 'name');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res, next) => {
  try {
    let item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Make sure user is item owner
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this item'
      });
    }
    
    // Handle image update
    if (req.file) {
      // Delete old image if exists
      if (item.image) {
        const oldImagePath = path.join(__dirname, '..', item.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      req.body.image = `/uploads/${req.file.filename}`;
    }

    item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    // Make sure user is item owner
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this item'
      });
    }
    
    // Delete image if exists
    if (item.image) {
      const imagePath = path.join(__dirname, '..', item.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};
