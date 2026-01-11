const stripeService = require('../services/payment/stripeService');
const {
  Order,
  User,
  OrderItem,
  Product,
  ProductVariant,
} = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Tạo payment intent Stripe
 */
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = 'usd', orderId } = req.body;
    const userId = req.user.id;

    // Nếu không có amount hoặc amount <= 0 thì báo lỗi
    if (!amount || amount <= 0) {
      throw new AppError('Amount không hợp lệ', 400);
    }

    // Tạo payment intent kèm metadata userId và orderId (nếu có)
    console.log('Đang tạo payment intent với metadata:', {
      userId,
      orderId: orderId || '',
    });

    // Tạo payment intent
    const paymentIntent = await stripeService.createPaymentIntent({
      amount,
      currency,
      metadata: {
        userId,
        orderId: orderId || '',
      },
    });

    console.log('Đã tạo payment intent:', {
      id: paymentIntent.paymentIntentId,
      metadata: paymentIntent.metadata,
    });

    res.status(200).json({
      status: 'success',
      data: paymentIntent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xác nhận thanh toán Stripe
 */
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;

    // Nếu không có paymentIntentId thì báo lỗi
    if (!paymentIntentId) {
      throw new AppError('Payment intent ID là bắt buộc', 400);
    }

    // Xác nhận payment intent
    const paymentIntent =
      await stripeService.confirmPaymentIntent(paymentIntentId);

    console.log('Payment Intent đã xác nhận:', {
      id: paymentIntent.id,
      status: paymentIntent.status,
      metadata: paymentIntent.metadata,
    });

    // Cập nhật trạng thái đơn hàng nếu có orderId trong metadata
    if (paymentIntent.metadata.orderId) {
      console.log('Đang cập nhật đơn hàng:', paymentIntent.metadata.orderId);
      console.log('Trạng thái Payment Intent:', paymentIntent.status);

      // Đầu tiên kiểm tra đơn hàng có tồn tại không
      const existingOrder = await Order.findByPk(
        paymentIntent.metadata.orderId,
      );

      console.log(
        'Đã tìm thấy đơn hàng hiện tại:',
        existingOrder
          ? {
              id: existingOrder.id,
              number: existingOrder.number,
              currentPaymentStatus: existingOrder.paymentStatus,
            }
          : 'Không tìm thấy đơn hàng',
      );

      // Chỉ cập nhật đơn hàng khi tồn tại đơn hàng và trạng thái thanh toán thành công
      if (existingOrder && paymentIntent.status === 'succeeded') {
        const updateResult = await Order.update(
          {
            status: 'processing', // Cập nhật trạng thái đơn hàng
            paymentStatus: 'paid', // Cập nhật trạng thái thanh toán
            paymentTransactionId: paymentIntent.id,
            paymentProvider: 'stripe',
            updatedAt: new Date(),
          },
          {
            where: { id: paymentIntent.metadata.orderId },
          },
        );

        console.log('Kết quả cập nhật đơn hàng:', updateResult);

        // Xác nhận lại đơn hàng sau khi cập nhật
        const updatedOrder = await Order.findByPk(
          paymentIntent.metadata.orderId,
        );

        console.log(
          'Đơn hàng sau khi cập nhật:',
          updatedOrder
            ? {
                id: updatedOrder.id,
                number: updatedOrder.number,
                status: updatedOrder.status, // Trạng thái đơn hàng
                paymentStatus: updatedOrder.paymentStatus, // Trạng thái thanh toán
                paymentTransactionId: updatedOrder.paymentTransactionId,
              }
            : 'Không tìm thấy đơn hàng sau khi cập nhật',
        );

        // Bây giờ giảm tồn kho vì thanh toán đã được xác nhận qua Stripe
        if (updatedOrder) {
          const { OrderItem, Product, ProductVariant } = require('../models');

          // Lấy các mục đơn hàng để giảm tồn kho
          const orderItems = await OrderItem.findAll({
            where: { orderId: updatedOrder.id },
          });

          for (const item of orderItems) {
            // Có 2 case: sản phẩm có biển thể và không có biến thể
            if (item.variantId) {
              // Case sản phẩm có biến thể

              // Giảm tồn kho cho biến thể sản phẩm bằng phương thức decrement
              await ProductVariant.decrement(
                { stockQuantity: item.quantity },
                { where: { id: item.variantId } },
              );
            } else {
              // Case sản phẩm không có biến thể

              // Giảm tồn kho cho sản phẩm bằng phương thức decrement
              await Product.decrement(
                { stockQuantity: item.quantity },
                { where: { id: item.productId } },
              );
            }
          }

          console.log(
            `Đã giảm tồn kho cho đơn hàng ${updatedOrder.id} sau khi xác nhận thanh toán qua Stripe`,
          );
        }
      } else if (!existingOrder) {
        console.log(
          'Không tìm thấy đơn hàng với ID:',
          paymentIntent.metadata.orderId,
        );
      } else {
        console.log(
          'Thanh toán không thành công, trạng thái:',
          paymentIntent.status,
        );
      }
    } else {
      console.log('Không tìm thấy orderId trong metadata của payment intent');
    }

    res.status(200).json({
      status: 'success',
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount:
            paymentIntent.currency === 'vnd'
              ? paymentIntent.amount
              : paymentIntent.amount / 100,
          currency: paymentIntent.currency,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo khách hàng Stripe
 */
const createCustomer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    // Kiểm tra xem người dùng đã có Stripe customer ID chưa
    if (user.stripeCustomerId) {
      // Nếu đã có, lấy thông tin khách hàng từ Stripe
      const customer = await stripeService.getCustomer(user.stripeCustomerId);

      return res.status(200).json({
        status: 'success',
        data: { customer },
      });
    }

    // Nếu chưa có, tạo khách hàng mới trên Stripe
    const customer = await stripeService.createCustomer({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      metadata: {
        userId: user.id,
      },
    });

    // Lưu Stripe customer ID vào user
    await user.update({ stripeCustomerId: customer.id });

    res.status(201).json({
      status: 'success',
      data: { customer },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy phương thức thanh toán Stripe
 */
const getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    // Nếu không tìm thấy user hoặc user không có stripeCustomerId thì trả về mảng rỗng
    if (!user || !user.stripeCustomerId) {
      return res.status(200).json({
        status: 'success',
        data: { paymentMethods: [] },
      });
    }

    // Lấy phương thức thanh toán từ Stripe dựa trên stripeCustomerId
    const paymentMethods = await stripeService.getPaymentMethods(
      user.stripeCustomerId,
    );

    res.status(200).json({
      status: 'success',
      data: { paymentMethods },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo setup intent để lưu phương thức thanh toán Stripe
 */
const createSetupIntent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    // Kiểm tra xem người dùng đã có Stripe customer ID chưa
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      // Nếu chưa có, tạo khách hàng mới trên Stripe

      const customer = await stripeService.createCustomer({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: user.id },
      });

      customerId = customer.id;

      await user.update({ stripeCustomerId: customerId });
    }

    // Tạo setup intent
    const setupIntent = await stripeService.createSetupIntent(customerId);

    res.status(200).json({
      status: 'success',
      data: setupIntent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xử lý webhook Stripe
 */
const handleWebhook = async (req, res, next) => {
  try {
    /**
     * Đối với sandbox/development, tạm thời bỏ qua việc xác thực webhook
     */
    console.log('Webhook đã được nhận ở chế độ sandbox/development');
    // return res.status(200).json({ received: true });

    /**
     * Đối với production, xác thực webhook bằng signature khi có webhook secret
     */
    // Lấy signature từ header và payload từ body
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    // Xử lý webhook và xác thực signature
    const event = await stripeService.handleWebhook(payload, signature);

    // Xử lý các loại event khác nhau
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Case thanh toán thành công
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        // Case thanh toán thất bại
        await handlePaymentFailed(event.data.object);
        break;
      case 'customer.created':
        // Case khách hàng được tạo
        console.log('Khách hàng đã được tạo:', event.data.object.id);
        break;
      default:
        // Các case khác chưa xử lý
        console.log(`Loại event chưa được xử lý: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function để xử lý thanh toán thành công Stripe
 */
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    if (paymentIntent.metadata.orderId) {
      await Order.update(
        {
          status: 'processing', // Cập nhật trạng thái đơn hàng
          paymentStatus: 'paid', // Cập nhật trạng thái thanh toán
          paymentTransactionId: paymentIntent.id,
          paymentProvider: 'stripe',
        },
        {
          where: { id: paymentIntent.metadata.orderId },
        },
      );

      // Bây giờ giảm tồn kho vì thanh toán đã được xác nhận qua webhook Stripe
      const { OrderItem, Product, ProductVariant } = require('../models');

      // Lấy các mục đơn hàng để giảm tồn kho
      const orderItems = await OrderItem.findAll({
        where: { orderId: paymentIntent.metadata.orderId },
      });

      for (const item of orderItems) {
        if (item.variantId) {
          // Case sản phẩm có biến thể

          // Giảm tồn kho cho biến thể sản phẩm bằng phương thức decrement
          await ProductVariant.decrement(
            { stockQuantity: item.quantity },
            { where: { id: item.variantId } },
          );
        } else {
          // Case sản phẩm không có biến thể

          // Giảm tồn kho cho sản phẩm bằng phương thức decrement
          await Product.decrement(
            { stockQuantity: item.quantity },
            { where: { id: item.productId } },
          );
        }
      }

      console.log(
        `Thanh toán thành công và đã giảm tồn kho cho đơn hàng: ${paymentIntent.metadata.orderId}`,
      );
    }
  } catch (error) {
    console.error('Lỗi khi xử lý thanh toán thành công:', error);
  }
};

/**
 * Helper function để xử lý thanh toán thất bại Stripe
 */
const handlePaymentFailed = async (paymentIntent) => {
  try {
    if (paymentIntent.metadata.orderId) {
      await Order.update(
        {
          paymentStatus: 'failed',
          paymentTransactionId: paymentIntent.id,
          paymentProvider: 'stripe',
        },
        {
          where: { id: paymentIntent.metadata.orderId },
        },
      );
      console.log(
        `Thanh toán thất bại với đơn hàng: ${paymentIntent.metadata.orderId}`,
      );
    }
  } catch (error) {
    console.error('Lỗi khi xử lý thanh toán thất bại:', error);
  }
};

/**
 * Tạo hoàn tiền Stripe (Admin)
 */
const createRefund = async (req, res, next) => {
  try {
    // Lấy thông tin hoàn tiền từ request body
    const { orderId, amount, reason } = req.body;

    // Nếu không có orderId thì báo lỗi
    if (!orderId) {
      throw new AppError('ID đơn hàng là bắt buộc', 400);
    }

    // Nếu không tìm thấy đơn hàng thì báo lỗi
    const order = await Order.findByPk(orderId);
    if (!order) {
      throw new AppError('Không tìm thấy đơn hàng', 404);
    }

    // Nếu đơn hàng không có paymentTransactionId thì báo lỗi
    if (!order.paymentTransactionId) {
      throw new AppError(
        'Không tìm thấy payment transaction cho đơn hàng này',
        400,
      );
    }

    // Tạo hoàn tiền qua Stripe
    const refund = await stripeService.createRefund({
      paymentIntentId: order.paymentTransactionId,
      amount,
      reason,
    });

    // Cập nhật trạng thái thanh toán của đơn hàng thành "refunded"
    await order.update({
      paymentStatus: 'refunded',
    });

    res.status(200).json({
      status: 'success',
      data: { refund },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function để xác thực SePay webhook bằng API key
 * Trả về true nếu hợp lệ, false nếu không hợp lệ
 */
const verifySePayApiKey = (req) => {
  // SePay sẽ gửi API key trong header Authorization dưới dạng "Authorization": "Apikey SEPAY_YOUR_API_KEY"
  const authHeader = req.headers.authorization;

  // Nếu không có header Authorization thì trả về false
  if (!authHeader) {
    console.error('Không tìm thấy header Authorization trong webhook SePay');
    return false;
  }

  // Kiểm tra xem định dạng header có đúng không (bắt đầu bằng "Apikey ")
  if (!authHeader.startsWith('Apikey ')) {
    console.error(
      'Định dạng header Authorization không hợp lệ trong webhook SePay',
    );
    return false;
  }

  // Trích xuất API key từ header
  const providedApiKey = authHeader.substring(7).trim(); // Xóa tiền tố "Apikey "

  // Lấy API key thực tế từ biến môi trường
  const expectedApiKey = process.env.SEPAY_API_KEY;

  // Nếu không có API key cấu hình trong biến môi trường thì cảnh báo
  if (!expectedApiKey) {
    console.warn('SePay API key không được cấu hình trong biến môi trường');
    // Trong development, có thể cho phép webhook mà không cần xác thực API key
    // Trả về true để tiếp tục xử lý webhook nếu ở môi trường development hoặc test
    return (
      process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    );
  }

  // Nếu không đang ở môi trường development hoặc test, tiến hành so sánh
  // So sánh API key được cung cấp với API key thực tế
  // Sử dụng constant-time comparison để tránh tấn công timing attack

  // Nếu dùng so sánh thông thường (===) có thể bị tấn công timing attack
  // vì thời gian so sánh có thể rò rỉ thông tin về độ dài và nội dung của API key
  // Thời gian so sánh cao hay thấp có thể giúp kẻ tấn công đoán được API key từng ký tự một
  // Thời gian so sánh càng dài chứng tỏ API key càng giống với API key thực tế
  // Việc so sánh sẽ dừng lại khi phát hiện ký tự khác biệt đầu tiên tính từ đầu chuỗi

  const expectedLength = expectedApiKey.length;
  const providedLength = providedApiKey.length;
  let mismatch = expectedLength !== providedLength;

  for (let i = 0; i < Math.max(expectedLength, providedLength); i++) {
    const expectedChar = expectedApiKey.charCodeAt(i) || 0;
    const providedChar = providedApiKey.charCodeAt(i) || 0;
    mismatch |= expectedChar ^ providedChar;
  }

  if (mismatch !== 0) {
    console.error('API key được cung cấp không hợp lệ');
    return false;
  }

  return true;
};

/**
 * Xử lý webhook SePay
 */
const handleSePayWebhook = async (req, res, next) => {
  try {
    // Xác minh nguồn webhook bằng cách xác thực API key
    if (!verifySePayApiKey(req)) {
      console.error('SePay API key không hợp lệ');
      return res.status(401).json({
        error: 'Webhook request không được phép vì API key không hợp lệ',
      });
    }

    // Lấy dữ liệu từ body
    const {
      id,
      gateway,
      transactionDate,
      accountNumber,
      code,
      content,
      transferType,
      transferAmount,
      accumulated,
      subAccount,
      referenceCode,
      description,
    } = req.body;

    console.log('Đã nhận webhook SePay với dữ liệu:', {
      id,
      transferAmount,
      content,
      transferType,
    });

    // Nếu thiếu các trường bắt buộc thì trả về lỗi
    if (!id || !transferType || !transferAmount || !transactionDate) {
      console.log('Thiếu các trường bắt buộc trong webhook SePay');
      return res.status(400).json({ error: 'Thiếu các trường bắt buộc' });
    }

    // Validate kiểu dữ liệu của các trường
    if (typeof id !== 'number' && typeof id !== 'string') {
      console.log(
        'Kiểu dữ liệu của transaction ID trong webhook SePay không hợp lệ',
      );
      return res
        .status(400)
        .json({ error: 'Kiểu dữ liệu của transaction ID không hợp lệ' });
    }
    if (
      typeof transferAmount !== 'number' ||
      typeof transferType !== 'string'
    ) {
      console.log('Kiểu dữ liệu không hợp lệ trong webhook SePay');
      return res.status(400).json({ error: 'Kiểu dữ liệu không hợp lệ' });
    }

    // Kiểm tra số tiền giao dịch phải là số dương
    if (transferAmount <= 0) {
      console.log('Số tiền giao dịch không hợp lệ:', transferAmount);
      return res
        .status(400)
        .json({ error: 'Số tiền giao dịch phải là số dương' });
    }

    // Kiểm tra loại giao dịch
    if (!['in', 'out'].includes(transferType)) {
      console.log('Loại giao dịch không hợp lệ:', transferType);
      return res.status(400).json({ error: 'Loại giao dịch không hợp lệ' });
    }

    // Chỉ xử lý các giao dịch tiền vào (incoming)
    if (transferType !== 'in') {
      console.log('Bỏ qua giao dịch tiền ra');
      return res
        .status(200)
        .json({ received: true, message: 'Bỏ qua giao dịch tiền ra' });
    }

    // Xác thực định dạng ngày giao dịch
    const parsedTransactionDate = new Date(transactionDate);
    if (isNaN(parsedTransactionDate.getTime())) {
      console.log('Định dạng ngày giao dịch không hợp lệ:', transactionDate);
      return res
        .status(400)
        .json({ error: 'Định dạng ngày giao dịch không hợp lệ' });
    }

    // Trích xuất ID đơn hàng từ nội dung chuyển khoản hoặc mã
    // Có thể tùy chỉnh dựa theo định dạng mong muốn
    // Ví dụ: nếu nội dung chuyển khoản chứa Order number như "Đơn hàng #ORD-12345 để thanh toán"
    // hoặc nếu mã chứa ID đơn hàng

    let orderId = null;

    // Thử trích xuất order ID từ nội dung chuyển khoản
    if (content) {
      // Tìm ID đơn hàng trong nội dung (điều chỉnh pattern theo định dạng mong muốn)

      // - ORD-12345, ORDER-12345
      // - ORD12345, ORDER12345 (without hyphen - like your example ORD251100012)
      // - order_123, order123
      // - SEPAY followed by number like SEPAY2845 (where 2845 might be order ID)
      // - Any 6+ digit number that might be an order ID
      const patterns = [
        /ORD[-_]?(\d+)/i, // Sẽ khớp với ORD12345, ORD-12345, ORD_12345
        /ORDER[-_]?(\d+)/i, // Sẽ khớp với ORDER12345, ORDER-12345, ORDER_12345
        /ORD[-_]?\w+/i, // Sẽ khớp với order number đầy đủ như ORD251100012
        /ORDER[-_]?\w+/i, // Sẽ khớp với order number đầy đủ như ORDERXXXXXXXX
        /order[-_\s]?(\d+)/i, // Sẽ khớp với order_123, order-123, order123
        /SEPAY(\d+)/i, // Sẽ khớp với SEPAY2845
        /SEPAY[-_\s]?(\d+)/i, // Sẽ khớp với SEPAY_2845, SEPAY-2845, SEPAY 2845
        /\b(\d{6,})\b/, // Sẽ khớp với bất kỳ số nào có 6 chữ số trở lên
      ];

      // Thử từng pattern để tìm kiếm orderId
      for (const pattern of patterns) {
        const match = content.match(pattern);

        if (match) {
          orderId = match[0];

          if (orderId) {
            // Nếu tìm thấy orderId, loại bỏ khoảng trắng thừa và dừng việc tìm kiếm
            orderId = orderId.trim();
            break;
          }
        }
      }
    }

    // Thử trích xuất từ ​​mã nếu không tìm thấy trong nội dung chuyển khoản
    if (!orderId && code) {
      const codePatterns = [
        /ORD[-_]?(\d+)/i, // Sẽ khớp với ORD12345, ORD-12345, ORD_12345
        /ORDER[-_]?(\d+)/i, // Sẽ khớp với ORDER12345, ORDER-12345, ORDER_12345
        /ORD[-_]?\w+/i, // Sẽ khớp với order number đầy đủ như ORD251100012
        /ORDER[-_]?\w+/i, // Sẽ khớp với order number đầy đủ như ORDERXXXXXXXX
        /order[-_\s]?(\d+)/i, // Sẽ khớp với order_123, order-123, order123
        /SEPAY(\d+)/i, // Sẽ khớp với SEPAY2845
        /SEPAY[-_\s]?(\d+)/i, // Sẽ khớp với SEPAY_2845, SEPAY-2845, SEPAY 2845
        /\b(\d{6,})\b/, // Sẽ khớp với bất kỳ số nào có 6 chữ số trở lên
      ];

      // Thử từng pattern để tìm kiếm orderId
      for (const pattern of codePatterns) {
        const match = code.match(pattern);

        if (match) {
          // Nếu tìm thấy orderId, loại bỏ khoảng trắng thừa và dừng việc tìm kiếm
          orderId = match[0];

          if (orderId) {
            orderId = orderId.trim();
            break;
          }
        }
      }
    }

    // Nếu vẫn không tìm thấy order ID, thử truy xuất từ referenceCode
    if (!orderId && referenceCode) {
      const refPatterns = [
        /ORD[-_]?(\d+)/i, // Sẽ khớp với ORD12345, ORD-12345, ORD_12345
        /ORDER[-_]?(\d+)/i, // Sẽ khớp với ORDER12345, ORDER-12345, ORDER_12345
        /ORD[-_]?\w+/i, // Sẽ khớp với order number đầy đủ như ORD251100012
        /ORDER[-_]?\w+/i, // Sẽ khớp với order number đầy đủ như ORDERXXXXXXXX
        /order[-_\s]?(\d+)/i, // Sẽ khớp với order_123, order-123, order123
        /SEPAY(\d+)/i, // Sẽ khớp với SEPAY2845
        /SEPAY[-_\s]?(\d+)/i, // Sẽ khớp với SEPAY_2845, SEPAY-2845, SEPAY 2845
        /\b(\d{6,})\b/, // Sẽ khớp với bất kỳ số nào có 6 chữ số trở lên
      ];

      // Thử từng pattern để tìm kiếm orderId
      for (const pattern of refPatterns) {
        const match = referenceCode.match(pattern);

        if (match) {
          // Nếu tìm thấy orderId, loại bỏ khoảng trắng thừa và dừng việc tìm kiếm
          orderId = match[0];

          if (orderId) {
            orderId = orderId.trim();
            break;
          }
        }
      }
    }

    // Nếu không tìm thấy orderId thì trả về thành công nhưng không xử lý gì thêm
    if (!orderId) {
      console.log('Không tìm thấy ID đơn hàng trong webhook SePay');
      return res.status(200).json({
        received: true,
        message:
          'Không tìm thấy ID đơn hàng trong giao dịch, đã xử lý thành công',
      });
    }

    console.log('Đang tìm đơn hàng với ID:', orderId);

    let order = null;

    // Thử nhiều cách để tìm đơn hàng
    try {
      // Đầu tiên, tìm kiếm theo số đơn hàng chính xác (như ORD-12345, được lưu trong trường 'number')
      order = await Order.findOne({
        where: {
          number: orderId,
        },
      });

      // Nếu không tìm thấy, thử các biến thể của định dạng order number
      // Vì có thể có sự khác biệt về định dạng giữa webhook và DB

      if (!order) {
        // Nếu orderId bắt đầu với "ORD" và có độ dài lớn hơn 7 ký tự
        // Ví dụ: webhook có "ORD251100012" nhưng DB lưu là "ORD-2511-00012"
        if (orderId.startsWith('ORD') && orderId.length > 7) {
          // Chèn dấu gạch ngang sau "ORD" và sau 4 ký tự tiếp theo
          const formattedOrderId = `${orderId.substring(0, 3)}-${orderId.substring(3, 7)}-${orderId.substring(7)}`;

          order = await Order.findOne({
            where: {
              number: formattedOrderId,
            },
          });
        }
      }

      // Nếu vẫn không tìm thấy, thử loại bỏ dấu gạch ngang nếu có, và tìm kiếm lại
      if (!order && orderId.includes('-')) {
        const unformattedOrderId = orderId.replace(/-/g, '');

        order = await Order.findOne({
          where: {
            number: unformattedOrderId,
          },
        });

        // Nếu vẫn không tìm thấy, chèn lại dấu gạch ngang theo định dạng chuẩn và tìm kiếm lại
        if (!order) {
          const formattedOrderId = `${unformattedOrderId.substring(0, 3)}-${unformattedOrderId.substring(3, 7)}-${unformattedOrderId.substring(7)}`;

          order = await Order.findOne({
            where: {
              number: formattedOrderId,
            },
          });
        }
      }

      // Nếu vẫn không tìm thấy, trích xuất phần số từ orderId và tìm kiếm
      if (!order) {
        // Trích xuất phần số từ orderId
        const numericPart = parseInt(orderId.replace(/\D/g, ''));

        // Nếu phần số hợp lệ, thử tìm kiếm
        if (!isNaN(numericPart)) {
          // Tìm kiếm đơn hàng có trường 'number' chứa phần số này
          order = await Order.findOne({
            where: {
              number: { [Op.iLike]: `%${numericPart}%` },
            },
          });
        }
      }

      // Nếu vẫn chưa tìm thấy, thử tìm đơn hàng có trường 'number' chứa toàn bộ orderId
      if (!order) {
        order = await Order.findOne({
          where: {
            [Op.or]: [{ number: { [Op.iLike]: `%${orderId}%` } }],
          },
        });
      }
    } catch (error) {
      console.error('Lỗi cơ sở dữ liệu khi tìm đơn hàng:', error);
      return res.status(500).json({ error: 'Lỗi xử lý đơn hàng' });
    }

    // Nếu không tìm thấy đơn hàng sau mọi cách, trả về thành công nhưng không xử lý gì thêm
    if (!order) {
      console.log('Không tìm thấy đơn hàng với ID:', orderId);
      return res.status(200).json({
        received: true,
        message: `Không tìm thấy đơn hàng với ID ${orderId}, đã xử lý thành công`,
      });
    }

    // Kiểm tra số tiền chuyển có khớp với tổng tiền của đơn hàng không
    const orderTotal = parseFloat(order.total);

    console.log('Đang so sánh số tiền chuyển và tổng tiền của đơn hàng:', {
      orderNumber: order.number,
      orderTotal: orderTotal,
      transferAmount: transferAmount,
      // Sử dụng dung sai nhỏ để so sánh dấu phẩy động
      isMatch: Math.abs(orderTotal - transferAmount) < 0.01,
    });

    // Kiểm tra xem số tiền có khớp không (cho phép sai số nhỏ do làm tròn)
    if (Math.abs(orderTotal - transferAmount) > 0.01) {
      console.log(
        `Số tiền không khớp: Tổng tiền của đơn hàng ${orderTotal} so với Số tiền chuyển ${transferAmount}`,
      );

      return res.status(200).json({
        received: true,
        message: 'Số tiền không khớp, đã xử lý thành công',
      });
    }

    // Ngăn chặn việc xử lý trùng lặp - kiểm tra xem ID giao dịch này đã được xử lý chưa
    // Nếu chưa xử lý, thì paymentTransactionId sẽ khác với id từ webhook
    // Nếu đã xử lý rồi, thì paymentTransactionId sẽ bằng với id từ webhook
    if (
      order.paymentTransactionId &&
      order.paymentTransactionId === id.toString()
    ) {
      console.log('Đã nhận được webhook trùng lặp với ID giao dịch:', id);

      return res.status(200).json({
        received: true,
        message: 'Webhook đã được xử lý rồi',
      });
    }

    // Cập nhật trạng thái đơn hàng thành đã thanh toán và đang xử lý nếu chưa được xử lý
    if (order.paymentStatus === 'pending' || order.paymentStatus === 'unpaid') {
      const updateResult = await Order.update(
        {
          status: 'processing', // Cập nhật trạng thái đơn hàng thành đang xử lý
          paymentStatus: 'paid', // Cập nhật trạng thái thanh toán thành đã thanh toán
          paymentTransactionId: id.toString(), // Lưu ID giao dịch SePay
          paymentProvider: 'sepay', // Đánh dấu nhà cung cấp thanh toán
          updatedAt: new Date(),
        },
        {
          where: { id: order.id },
        },
      );

      // Bây giờ giảm tồn kho vì thanh toán đã được xác nhận qua SePay

      // Lấy các mục đơn hàng để giảm tồn kho
      const orderItems = await OrderItem.findAll({
        where: { orderId: order.id },
      });

      for (const item of orderItems) {
        // Có 2 case: sản phẩm có biến thể và không có biến thể
        if (item.variantId) {
          // Case sản phẩm có biến thể

          // Giảm tồn kho cho biến thể sản phẩm bằng phương thức decrement
          await ProductVariant.decrement(
            { stockQuantity: item.quantity },
            { where: { id: item.variantId } },
          );
        } else {
          // Case sản phẩm không có biến thể

          // Giảm tồn kho cho sản phẩm bằng phương thức decrement
          await Product.decrement(
            { stockQuantity: item.quantity },
            { where: { id: item.productId } },
          );
        }
      }

      console.log('Đơn hàng đã được cập nhật thành công:', {
        orderId: order.id,
        orderNumber: order.number,
        paymentStatus: 'paid',
        status: 'processing',
        transactionId: id,
        paymentDate: parsedTransactionDate,
      });
    } else {
      console.log('Đơn hàng đã được xử lý:', {
        orderId: order.id,
        orderNumber: order.number,
        currentPaymentStatus: order.paymentStatus,
        currentOrderStatus: order.status,
      });
      return res.status(200).json({
        received: true,
        message: 'Đơn hàng đã được xử lý, webhook đã được xác nhận',
      });
    }

    res.status(200).json({
      received: true,
      message: 'SePay webhook đã được xử lý thành công',
      orderId: order.id,
      orderNumber: order.number,
      transactionId: id,
    });
  } catch (error) {
    console.error('Lỗi khi xử lý SePay webhook:', error);
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createCustomer,
  getPaymentMethods,
  createSetupIntent,
  handleWebhook,
  createRefund,
  handleSePayWebhook,
};
