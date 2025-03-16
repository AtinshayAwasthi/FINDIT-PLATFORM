
const Item = require('../models/Item');
const cloudinary = require('cloudinary').v2;

// Get all items with filtering
exports.getItems = async (req, res) => {
  try {
    const { type, category, search, location, startDate, endDate } = req.query;
    
    // Build query
    const query = {};
    
    // Type filter (lost/found)
    if (type) {
      query.type = type;
    }
    
    // Category filter
    if (category) {
      query.category = category;
    }
    
    // Location filter
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'name');
      
    res.status(200).json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get recent items
exports.getRecentItems = async (req, res) => {
  try {
    const items = await Item.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('user', 'name');
      
    res.status(200).json(items);
  } catch (error) {
    console.error('Get recent items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user's items
exports.getUserItems = async (req, res) => {
  try {
    const { type } = req.params;
    
    const items = await Item.find({
      user: req.user.id,
      type: type
    })
    .sort({ createdAt: -1 });
    
    res.status(200).json(items);
  } catch (error) {
    console.error('Get user items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate('user', 'name');
      
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.status(200).json(item);
  } catch (error) {
    console.error('Get item by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new item
exports.createItem = async (req, res) => {
  try {
    const { title, description, location, category, date, type } = req.body;
    
    // Create new item
    const item = new Item({
      title,
      description,
      location,
      category,
      date,
      type,
      user: req.user.id
    });
    
    // Handle image upload with Cloudinary
    if (req.file) {
      item.image = req.file.path; // Cloudinary returns the URL in the path
    }
    
    await item.save();
    
    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    let item = await Item.findById(req.params.id);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check ownership
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update fields
    const { title, description, location, category, date, type } = req.body;
    
    if (title) item.title = title;
    if (description) item.description = description;
    if (location) item.location = location;
    if (category) item.category = category;
    if (date) item.date = date;
    if (type) item.type = type;
    
    // Handle image upload with Cloudinary
    if (req.file) {
      // Delete old image from Cloudinary if exists
      if (item.image) {
        const publicId = item.image.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`retriever-hub/${publicId}`);
      }
      
      item.image = req.file.path; // Cloudinary returns the URL in the path
    }
    
    await item.save();
    
    res.status(200).json(item);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check ownership
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete image from Cloudinary if exists
    if (item.image) {
      const publicId = item.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`retriever-hub/${publicId}`);
    }
    
    await Item.deleteOne({ _id: req.params.id });
    
    res.status(200).json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
