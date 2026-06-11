const Note = require('../models/Note');

// GET notes by studentId
const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ studentId: req.query.studentId }).sort({ createdAt: -1 });
    res.json({ success: true, data: notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create note
const createNote = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const note = await Note.create({
      ...req.body,
      date: today,
      author: 'Admin',
    });
    res.status(201).json({ success: true, data: note });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE note
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found.' });
    res.json({ success: true, message: 'Note deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotes,
  createNote,
  deleteNote,
};