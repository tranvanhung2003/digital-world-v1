require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/sequelize');
const logger = require('./utils/logger');

// Kiểm tra kết nối tới database và đồng bộ hóa các model
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Kết nối tới database đã được thiết lập thành công.');

    // Load các model và các relationships giữa các model
    require('./models');
    logger.info('Các model của Sequelize đã được load thành công.');

    // Đồng bộ hóa các model với database
    if (
      process.env.NODE_ENV === 'development' &&
      process.env.DB_SYNC === 'true'
    ) {
      // Sử dụng `alter: true` thay vì `force: true` để bảo toàn dữ liệu
      // `force: true` sẽ drop và tạo lại toàn bộ các bảng (xóa tất cả dữ liệu)
      // `alter: true` sẽ modify các bảng hiện có để khớp với các model
      await sequelize.sync({ alter: true });
      logger.info(
        'Các bảng trong cơ sở dữ liệu đã được đồng bộ hóa thành công (bảo toàn dữ liệu).',
      );
    }
  } catch (error) {
    logger.error('Không thể kết nối tới database:', error);
    logger.error('Chi tiết lỗi:', error.message);
    logger.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

// Add stripe column if not exists
const addStripeColumn = async () => {
  try {
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);
    `);
    logger.info('✅ stripe_customer_id column ensured');
  } catch (error) {
    logger.error('Error adding stripe column:', error.message);
  }
};

// Khởi động server
const startServer = async () => {
  await connectDB();
  await addStripeColumn();

  const PORT = process.env.PORT || 8888;
  const server = app.listen(PORT, () => {
    logger.info(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
  });

  // Xử lý uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    logger.error(err.stack);
    process.exit(1);
  });

  // Xử lý unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger.error(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });

  // Xử lý SIGTERM signal
  process.on('SIGTERM', () => {
    logger.info('👋 SIGTERM RECEIVED. Shutting down gracefully');
    server.close(() => {
      logger.info('💥 Process terminated!');
    });
  });
};

startServer();
