
const ItemRequest = require('../models/ItemRequest');
const Item = require('../models/Item');

// Create a new item request
exports.createRequest = async (req, res) => {
  try {
    const { message } = req.body;
    const itemId = req.params.id;
    const userId = req.user.id;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Prevent user from requesting their own item
    if (item.user.toString() === userId) {
      return res.status(400).json({ message: 'You cannot request your own item' });
    }

    // Create new request
    const request = new ItemRequest({
      item: itemId,
      user: userId,
      message
    });

    await request.save();

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      request
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all requests for an item (for item owner)
exports.getItemRequests = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Check if item exists and belongs to user
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view these requests' });
    }
    
    const requests = await ItemRequest.find({ item: itemId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
      
    res.status(200).json(requests);
  } catch (error) {
    console.error('Get item requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all requests by a user
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await ItemRequest.find({ user: req.user.id })
      .populate('item')
      .sort({ createdAt: -1 });
      
    res.status(200).json(requests);
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update request status (for item owner)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const requestId = req.params.requestId;
    
    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Find request
    const request = await ItemRequest.findById(requestId)
      .populate('item');
      
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Check if user is the item owner
    if (request.item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }
    
    // Update status
    request.status = status;
    await request.save();
    
    res.status(200).json({
      success: true,
      message: `Request ${status}`,
      request
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
