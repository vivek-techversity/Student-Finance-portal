const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getNotes,
  createNote,
  deleteNote,
} = require('../controllers/noteController');

router.use(verifyToken);


router.route('/').get(getNotes).post(createNote);


router.route('/:id').delete(deleteNote);

module.exports = router;
