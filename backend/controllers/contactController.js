
const Item = require('../models/Item');
const User = require('../models/User');

// Get contact info for an item owner
exports.getContactInfo = async (req, res) => {
  try {
    const itemId = req.params.id;
    
    // Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Find the item owner
    const owner = await User.findById(item.user).select('name email phone');
    if (!owner) {
      return res.status(404).json({ message: 'Item owner not found' });
    }
    
    // Only return necessary contact info
    const contactInfo = {
      name: owner.name,
      email: owner.email,
      phone: owner.phone || 'Not provided'
    };
    
    res.status(200).json(contactInfo);
  } catch (error) {
    console.error('Get contact info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
