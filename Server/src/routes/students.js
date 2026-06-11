const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getStudents,
  getStudent,
  getStudentByEmail,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController')
router.use(verifyToken);

// Email lookup — Add Student form mein auto-fill ke liye
router.get('/lookup/email', getStudentByEmail);

router.route('/').get(getStudents).post(createStudent);

router.route('/:id').get(getStudent).put(updateStudent).delete(deleteStudent);

module.exports = router;