const Payment = require('../models/Payment');
const Student = require('../models/Student');

// GET all payments (optionally filter by studentId)
const getPayments = async (req, res) => {
  try {
    const filter = req.query.studentId ? { studentId: req.query.studentId } : {};
    const payments = await Payment.find(filter).sort({ date: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create payment
const createPayment = async (req, res) => {
  try {
    const student = await Student.findById(req.body.studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const payment = await Payment.create(req.body);
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT update payment
const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE payment
const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found.' });
    res.json({ success: true, message: 'Payment deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
};