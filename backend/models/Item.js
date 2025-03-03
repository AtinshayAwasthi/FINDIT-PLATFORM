
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title can not be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description can not be more than 1000 characters']
  },
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  date: {
    type: Date,
    required: [true, 'Please provide a date']
  },
  type: {
    type: String,
    enum: ['lost', 'found'],
    required: [true, 'Please specify if the item is lost or found']
  },
  image: {
    type: String
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', ItemSchema);
