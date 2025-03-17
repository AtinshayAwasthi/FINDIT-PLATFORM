
const mongoose = require('mongoose');

const ItemReportSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  reporterEmail: {
    type: String,
    required: [true, 'Please provide your email']
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason']
  },
  details: {
    type: String,
    required: [true, 'Please provide details']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ItemReport', ItemReportSchema);
