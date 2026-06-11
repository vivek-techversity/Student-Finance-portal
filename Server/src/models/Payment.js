const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    amountUSD: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    exchangeRate: {
      type: Number,
      required: true,
    },

    // Enum hataya — ab custom method save ho sakta hai (Crypto, Cheque, etc.)
    method: {
      type: String,
      trim: true,
      default: 'Bank Transfer',
    },

    // ── Deductions ────────────────────────
    bankCharge: {
      type: Number,
      default: 0,
    },
    gatewayFee: {
      type: Number,
      default: 0,
    },
    otherDeduction: {
      type: Number,
      default: 0,
    },

    note: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);