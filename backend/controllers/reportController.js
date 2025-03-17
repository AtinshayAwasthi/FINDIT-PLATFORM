
const ItemReport = require('../models/ItemReport');
const Item = require('../models/Item');

// Create a new item report
exports.createReport = async (req, res) => {
  try {
    const { reporterEmail, reason, details } = req.body;
    const itemId = req.params.id;

    if (!itemId) {
      return res.status(400).json({ 
        success: false,
        message: 'Item ID is required' 
      });
    }

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    // Validate required fields
    if (!reporterEmail || !reason || !details) {
      return res.status(400).json({
        success: false,
        message: 'Email, reason, and details are required fields'
      });
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
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all reports (admin only)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await ItemReport.find().populate('item').sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update report status (admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    
    const report = await ItemReport.findByIdAndUpdate(
      req.params.reportId,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
