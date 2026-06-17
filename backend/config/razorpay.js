const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
const createOrder = async (options) => {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: options.receipt || `receipt_${Date.now()}`,
      notes: options.notes || {},
      payment_capture: 1 // Auto capture payment
    });
    return order;
  } catch (error) {
    console.error('Razorpay order creation error:', error.message);
    throw new Error('Failed to create payment order');
  }
};

// Verify Razorpay payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  const crypto = require('crypto');
  const payload = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(payload.toString())
    .digest('hex');

  return expectedSignature === signature;
};

// Verify webhook signature
const verifyWebhookSignature = (body, signature) => {
  const crypto = require('crypto');
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(body))
    .digest('hex');

  return expectedSignature === signature;
};

// Refund payment
const createRefund = async (paymentId, amount = null) => {
  try {
    const refund = await razorpay.refunds.create({
      payment_id: paymentId,
      amount: amount ? amount * 100 : undefined, // in paise
      notes: { reason: 'Requested by customer' }
    });
    return refund;
  } catch (error) {
    console.error('Razorpay refund error:', error.message);
    throw new Error('Failed to process refund');
  }
};

module.exports = {
  razorpay,
  createOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  createRefund
};
