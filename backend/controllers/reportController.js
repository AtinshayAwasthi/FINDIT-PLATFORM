
const ItemReport = require('../models/ItemReport');
const Item = require('../models/Item');

// Create a new item report
exports.createItemReport = async (req, res) => {
  try {
    const { itemId, reason, email } = req.body;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    // Create new report
    const report = new ItemReport({
      item: itemId,
      reason,
      email
    });

    await report.save();

    // In a production environment, send email notification to administrators
    // This is where you would integrate an email service

    res.status(201).json({ 
      success: true,
      message: 'Report submitted successfully' 
    });
  } catch (error) {
    console.error('Create item report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all reports (admin only)
exports.getReports = async (req, res) => {
  try {
    // In a production app, you would check if the user is an admin
    // For now, we'll just return all reports
    
    const reports = await ItemReport.find()
      .sort({ createdAt: -1 })
      .populate({
        path: 'item',
        select: 'title type user',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });
    
    res.status(200).json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update report status (admin only)
exports.updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status } = req.body;
    
    // Find the report
    const report = await ItemReport.findById(reportId);
    
    // Check if report exists
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    
    // In a production app, you would check if the user is an admin
    
    // Update report status
    report.status = status;
    await report.save();
    
    res.status(200).json({ 
      success: true,
      message: 'Report status updated successfully' 
    });
  } catch (error) {
    console.error('Update report status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
