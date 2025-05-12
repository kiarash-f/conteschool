const mongoose = require('mongoose');
const userModel = require('./userModel');

const studentWorkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});
const StudentWork = mongoose.model('StudentWork', studentWorkSchema);
module.exports = StudentWork;
