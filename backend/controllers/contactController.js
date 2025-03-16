
const Item = require('../models/Item');
const User = require('../models/User');

// Get contact information for an item
exports.getItemContact = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find the item
    const item = await Item.findById(itemId);
    
    // Check if item exists
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Get item owner info
    const owner = await User.findById(item.user).select('name email phone');
    
    if (!owner) {
      return res.status(404).json({ message: 'Item owner not found' });
    }
    
    // Return contact info
    res.status(200).json({
      name: owner.name,
      email: owner.email,
      phone: owner.phone || 'Not provided'
    });
  } catch (error) {
    console.error('Get item contact error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
