const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
} = require('../controllers/paymentController');

router.use(verifyToken);


router.route('/').get(getPayments).post(createPayment);


router.route('/:id').put(updatePayment).delete(deletePayment);

module.exports = router;