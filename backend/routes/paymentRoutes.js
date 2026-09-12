const express = require('express');
const router = express.Router();
const { initiatePayment, verifyPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/esewa/initiate/:orderId', protect, initiatePayment);
router.get('/esewa/verify', verifyPayment);

module.exports = router;
