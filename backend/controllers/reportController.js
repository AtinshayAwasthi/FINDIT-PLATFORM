
const ItemReport = require('../models/ItemReport');
const Item = require('../models/Item');

// Create a new item report
exports.createReport = async (req, res) => {
  try {
    const { reporterEmail, reason, details } = req.body;
    const itemId = req.params.id;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Create new report
    const report = new ItemReport({
      item: itemId,
      reporterEmail,
      reason,
      details
    });

    await report.save();

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully'
    });
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
