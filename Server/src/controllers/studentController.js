const Student = require('../models/Student');
const Payment = require('../models/Payment');
const Note = require('../models/Note');

// GET all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET single student
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST create student
// Optional initial payment fields: initPayAmt, initPayMethod, initBankCharge, initGatewayFee, initOtherDed
const createStudent = async (req, res) => {
  try {
    const {
      initPayAmt,
      initPayMethod,
      initBankCharge,
      initGatewayFee,
      initOtherDed,
      ...studentData
    } = req.body;

    const student = await Student.create(studentData);

    let initialPayment = null;
    if (initPayAmt && Number(initPayAmt) > 0) {
      const today = new Date().toISOString().split('T')[0];
      initialPayment = await Payment.create({
        studentId: student._id,
        date: today,
        amountUSD: Number(initPayAmt),
        exchangeRate: student.exchangeRate || 83,
        method: initPayMethod || 'Bank Transfer',
        bankCharge: Number(initBankCharge) || 0,
        gatewayFee: Number(initGatewayFee) || 0,
        otherDeduction: Number(initOtherDed) || 0,
        note: 'Initial payment',
      });
    }

    res.status(201).json({
      success: true,
      data: student,
      initialPayment: initialPayment || null,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT update student
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE student + payments + notes
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    await Payment.deleteMany({ studentId: req.params.id });
    await Note.deleteMany({ studentId: req.params.id });
    await Student.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Student deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
};