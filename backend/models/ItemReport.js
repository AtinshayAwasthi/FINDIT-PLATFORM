
const mongoose = require('mongoose');

const ItemReportSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  reporterEmail: {
    type: String,
    required: [true, 'Please provide your email'],
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email address']
  },
  reason: {
    type: String,
    required: [true, 'Please provide a reason'],
    minlength: [10, 'Reason must be at least 10 characters']
  },
  details: {
    type: String,
    required: [true, 'Please provide details'],
    minlength: [10, 'Details must be at least 10 characters']
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
