const mongoose = require('mongoose');
const User = require('./userModel');
const slugify = require('slugify');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'News must have a title'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
  },
  description: {
    type: String,
    required: [true, 'News must have a description'],
    minlength: [10, 'Description must be at least 10 characters'],
  },
  image: {
    type: String,
    required: [true, 'News must have an image'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft',
  },
}, {
  timestamps: true
});
// Middleware to create a slug from the title before saving
newsSchema.pre('save', function(next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

const News = mongoose.model('News', newsSchema);
module.exports = News;
