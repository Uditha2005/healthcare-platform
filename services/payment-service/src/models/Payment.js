const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'lkr'
  },
  status: {
    type: String,
    enum: [
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'requires_capture',
      'canceled',
      'succeeded',
      'failed'
    ],
    default: 'requires_payment_method'
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true
  },
  metadata: {
    type: Object,
    default: {}
  }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
