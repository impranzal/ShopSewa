const crypto = require('crypto');
const Order = require('../models/Order');

/**
 * eSewa ePay v2 requires an HMAC-SHA256 signature over a fixed field string,
 * base64-encoded, using the merchant secret key.
 */
function generateSignature(message, secretKey) {
  const hash = crypto.createHmac('sha256', secretKey).update(message).digest('base64');
  return hash;
}

exports.initiatePayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const amount = order.totalPrice;
    const taxAmount = 0;
    const totalAmount = amount + taxAmount;
    const transactionUuid = order.transactionUuid;
    const productCode = process.env.ESEWA_PRODUCT_CODE;

    const signedFieldNames = 'total_amount,transaction_uuid,product_code';
    const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    const signature = generateSignature(message, process.env.ESEWA_SECRET_KEY);

    res.json({
      paymentUrl: process.env.ESEWA_PAYMENT_URL,
      formData: {
        amount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: 0,
        product_delivery_charge: 0,
        success_url: `${process.env.CLIENT_URL}/esewa/success`,
        failure_url: `${process.env.CLIENT_URL}/esewa/failure`,
        signed_field_names: signedFieldNames,
        signature,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    // eSewa redirects with a base64-encoded JSON payload in `data`
    const decoded = JSON.parse(Buffer.from(req.query.data, 'base64').toString('utf-8'));
    const { transaction_uuid, status, total_amount } = decoded;

    const order = await Order.findOne({ transactionUuid: transaction_uuid });
    if (!order) return res.status(404).json({ message: 'Order not found for this transaction' });

    if (status === 'COMPLETE') {
      order.paymentStatus = 'paid';
      await order.save();
      return res.json({ message: 'Payment verified', order });
    }

    order.paymentStatus = 'failed';
    await order.save();
    res.status(400).json({ message: 'Payment not completed', status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
