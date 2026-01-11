const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// STRIPE WEBHOOK (KHÔNG CẦN XÁC THỰC)

router.post(
  '/webhook', // POST /api/payment/webhook - Xử lý webhook Stripe
  express.raw({ type: 'application/json' }),
  paymentController.handleWebhook,
);

// SEPAY WEBHOOK (KHÔNG CẦN XÁC THỰC)

router.post(
  '/sepay-webhook', // POST /api/payment/sepay-webhook - Xử lý webhook SePay
  express.json(), // SePay sends JSON data
  paymentController.handleSePayWebhook,
);

// AUTHENTICATED ROUTES
router.use(authenticate);

router.post(
  '/create-payment-intent', // POST /api/payment/create-payment-intent - Tạo payment intent Stripe
  paymentController.createPaymentIntent,
);

router.post(
  '/confirm-payment', // POST /api/payment/confirm-payment - Xác nhận thanh toán Stripe
  paymentController.confirmPayment,
);

// CUSTOMER ROUTES

router.post(
  '/create-customer', // POST /api/payment/create-customer - Tạo khách hàng Stripe
  paymentController.createCustomer,
);
router.get(
  '/payment-methods', // GET /api/payment/payment-methods - Lấy phương thức thanh toán Stripe
  paymentController.getPaymentMethods,
);
router.post(
  '/create-setup-intent', // POST /api/payment/create-setup-intent - Tạo setup intent để lưu phương thức thanh toán Stripe
  paymentController.createSetupIntent,
);

// ADMIN ROUTES

router.post(
  '/refund', // POST /api/payment/refund - Tạo hoàn tiền Stripe (Admin)
  authorize('admin'),
  paymentController.createRefund,
);

module.exports = router;
