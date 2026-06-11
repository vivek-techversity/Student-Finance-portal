const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Note text is required'],
      trim: true,
    },
    author: {
      type: String,
      default: 'Admin',
    },
    date: {
      type: String, // YYYY-MM-DD
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', noteSchema);