const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    authority: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    description: { type: String },
    email: { type: String },
    mobile: { type: String },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
    },
    ref_id: { type: String },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
