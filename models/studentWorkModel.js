const mongoose = require('mongoose');

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
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const StudentWork = mongoose.model('StudentWork', studentWorkSchema);
module.exports = StudentWork;
