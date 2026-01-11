const Stripe = require('stripe');
const { AppError } = require('../../middlewares/errorHandler');

// Khởi tạo Stripe bằng secret key từ biến môi trường
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

class StripeService {
  /**
   * Tạo payment intent để thanh toán
   * @param {Object} params - Tham số tạo payment intent
   * @param {number} params.amount - Số tiền (tính bằng cent)
   * @param {string} params.currency - Mã tiền tệ (mặc định: 'usd')
   * @param {Object} params.metadata - Metadata bổ sung
   * @returns {Object} Đối tượng payment intent
   */
  async createPaymentIntent({ amount, currency = 'usd', metadata = {} }) {
    try {
      // Chuyển đổi số tiền cho đúng định dạng của Stripe
      const stripeAmount =
        currency === 'vnd' ? Math.round(amount) : Math.round(amount * 100);

      console.log('Đang tạo payment intent với tham số:', {
        amount: stripeAmount,
        currency,
        metadata,
        originalAmount: amount,
      });

      // Tạo payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      console.error('Lỗi createPaymentIntent Stripe:', error);
      console.error('Chi tiết lỗi:', {
        message: error.message,
        type: error.type,
        code: error.code,
        param: error.param,
        statusCode: error.statusCode,
      });
      throw new AppError(`Tạo payment intent thất bại: ${error.message}`, 500);
    }
  }

  /**
   * Xác nhận payment intent
   * @param {string} paymentIntentId - Payment intent ID
   * @returns {Object} Đối tượng payment intent
   */
  async confirmPaymentIntent(paymentIntentId) {
    try {
      // Lấy thông tin payment intent
      const paymentIntent =
        await stripe.paymentIntents.retrieve(paymentIntentId);

      return paymentIntent;
    } catch (error) {
      console.error('Lỗi xác nhận payment intent Stripe:', error);
      throw new AppError('Xác nhận payment intent thất bại', 500);
    }
  }

  /**
   * Tạo khách hàng
   * @param {Object} params - Tham số tạo khách hàng
   * @param {string} params.email - Email khách hàng
   * @param {string} params.name - Tên khách hàng
   * @param {Object} params.metadata - Metadata bổ sung
   * @returns {Object} Đối tượng khách hàng
   */
  async createCustomer({ email, name, metadata = {} }) {
    try {
      // Tạo khách hàng mới
      const customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });

      return customer;
    } catch (error) {
      console.error('Lỗi tạo khách hàng Stripe:', error);
      throw new AppError('Tạo khách hàng thất bại', 500);
    }
  }

  /**
   * Truy xuất khách hàng
   * @param {string} customerId - ID khách hàng
   * @returns {Object} Đối tượng khách hàng
   */
  async getCustomer(customerId) {
    try {
      // Truy xuất thông tin khách hàng
      const customer = await stripe.customers.retrieve(customerId);

      return customer;
    } catch (error) {
      console.error('Lỗi truy xuất khách hàng Stripe:', error);
      throw new AppError('Truy xuất khách hàng thất bại', 500);
    }
  }

  /**
   * Tạo hoàn tiền
   * @param {Object} params - Tham số tạo hoàn tiền
   * @param {string} params.paymentIntentId - ID payment intent
   * @param {number} params.amount - Số tiền hoàn trả (tính bằng cent, tùy chọn, hoàn trả toàn bộ nếu không cung cấp)
   * @param {string} params.reason - Lý do hoàn tiền
   * @returns {Object} Đối tượng hoàn tiền
   */
  async createRefund({
    paymentIntentId,
    amount,
    reason = 'requested_by_customer',
  }) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100); // Chuyển đổi sang cent
      }

      const refund = await stripe.refunds.create(refundData);
      return refund;
    } catch (error) {
      console.error('Lỗi tạo hoàn tiền Stripe:', error);
      throw new AppError('Tạo hoàn tiền thất bại', 500);
    }
  }

  /**
   * Xử lý webhook từ Stripe
   * @param {string} payload - Nội dung request body thô
   * @param {string} signature - Stripe signature header
   * @returns {Object} Đối tượng event
   */
  async handleWebhook(payload, signature) {
    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );

      return event;
    } catch (error) {
      console.error('Lỗi webhook Stripe:', error);
      throw new AppError('Signature webhook không hợp lệ', 400);
    }
  }

  /**
   * Lấy phương thức thanh toán cho khách hàng
   * @param {string} customerId - ID khách hàng
   * @returns {Array} Mảng phương thức thanh toán
   */
  async getPaymentMethods(customerId) {
    try {
      // Lấy danh sách phương thức thanh toán
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;
    } catch (error) {
      console.error('Lỗi lấy phương thức thanh toán Stripe:', error);
      throw new AppError('Lấy phương thức thanh toán thất bại', 500);
    }
  }

  /**
   * Tạo setup intent để lưu phương thức thanh toán
   * @param {string} customerId - ID khách hàng
   * @returns {Object} Đối tượng setup intent
   */
  async createSetupIntent(customerId) {
    try {
      // Tạo setup intent
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });

      return {
        clientSecret: setupIntent.client_secret,
        setupIntentId: setupIntent.id,
      };
    } catch (error) {
      console.error('Lỗi tạo setup intent Stripe:', error);
      throw new AppError('Tạo setup intent thất bại', 500);
    }
  }
}

module.exports = new StripeService();
