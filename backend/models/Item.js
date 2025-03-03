
const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Please specify if the item is lost or found'],
    enum: ['lost', 'found']
  },
  category: {
    type: String,
    required: [true, 'Please add a category']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  date: {
    type: Date,
    required: [true, 'Please add the date when the item was lost/found']
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'resolved'],
    default: 'open'
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Item', ItemSchema);
