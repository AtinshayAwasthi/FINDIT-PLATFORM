
const ItemRequest = require('../models/ItemRequest');
const Item = require('../models/Item');
const User = require('../models/User');

// Create a new item request
exports.createItemRequest = async (req, res) => {
  try {
    const { itemId, name, email, proof } = req.body;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Create new request
    const request = new ItemRequest({
      item: itemId,
      name,
      email,
      proof
    });

    await request.save();

    // Get item owner's email
    const itemOwner = await User.findById(item.user);
    
    // In a production environment, send email notification to the item owner
    // This is where you would integrate an email service like SendGrid or Nodemailer

    res.status(201).json({ 
      success: true,
      message: 'Request submitted successfully' 
    });
  } catch (error) {
    console.error('Create item request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all requests for an item (for item owner)
exports.getItemRequests = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find the item
    const item = await Item.findById(itemId);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check ownership
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Get all requests for this item
    const requests = await ItemRequest.find({ item: itemId })
      .sort({ createdAt: -1 });
    
    res.status(200).json(requests);
  } catch (error) {
    console.error('Get item requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update request status (for item owner)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    
    // Find the request
    const request = await ItemRequest.findById(requestId);
    
    // Check if request exists
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Find the associated item
    const item = await Item.findById(request.item);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check ownership
    if (item.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Update request status
    request.status = status;
    await request.save();
    
    // In a production environment, send email notification to the requester
    // This is where you would integrate an email service
    
    res.status(200).json({ 
      success: true,
      message: 'Request status updated successfully' 
    });
  } catch (error) {
    console.error('Update request status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
