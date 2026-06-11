const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    registrationDate: {
      type: String, // YYYY-MM-DD
      required: [true, 'Registration date is required'],
    },

    // Enum hataya — ab koi bhi custom string save ho sakti hai
    // Dropdown options frontend pe hain, DB pe restrict nahi
    region: {
      type: String,
      required: [true, 'Region is required'],
      trim: true,
    },
    program: {
      type: String,
      required: [true, 'Program is required'],
      trim: true,
    },

    university: {
      type: String,
      required: true,
      trim: true,
    },

    // ── Journey / Lifecycle Status ─────────────
    journeyStatus: {
      type: String,
      enum: ['Admission', 'Activation', 'Learning', 'Research', 'Submission', 'Conferment', 'Alumni', 'Ghost', 'Refund', 'Admission Cancelled'],
      default: 'Admission',
    },

    // ── Fees ──────────────────────────────
    totalFee: {
      type: Number,
      required: [true, 'Total fee is required'],
    },
    exchangeRate: {
      type: Number,
      default: 83,
    },

    // ── Cost Breakdown ────────────────────
    uniFee: {
      type: Number,
      default: 0,
    },
    consultantComm: {
      type: Number,
      default: 0,
    },
    thesisCost: {
      type: Number,
      default: 0,
    },
    shipmentCost: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);