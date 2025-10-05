const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    authority: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    amount: { type: Number, required: true, min: 1 }, // store in RIAL
    description: String,
    email: String,
    mobile: String,

    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending',
      index: true,
    },

    ref_id: { type: String, index: true }, // useful to search receipts
    card_pan: { type: String }, // masked card (from verify)
    fee: { type: Number }, // Zarinpal fee (if provided)
    verifiedAt: { type: Date },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // ✅ fixed
      required: true,
      index: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true, // keep true if every payment is tied to a course
      index: true,
    },
  },
  { timestamps: true }
);

// Helpful compound index for admin queries
paymentSchema.index({ student: 1, course: 1, status: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
