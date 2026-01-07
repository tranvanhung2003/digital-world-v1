const logger = require('../utils/logger');

/**
 * Service để log các hoạt động của admin
 * Giúp audit và monitor các thay đổi quan trọng
 */
class AdminAuditService {
  /**
   * Log hoạt động CRUD trên user
   */
  static logUserAction(
    adminUser,
    action,
    targetUserId,
    changes = {},
    ip = null,
  ) {
    if (!adminUser) {
      console.error('AdminAuditService.logUserAction: adminUser is undefined');
      return;
    }

    const logData = {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminRole: adminUser.role,
      action,
      targetUserId,
      changes,
      timestamp: new Date().toISOString(),
      ip,
    };

    logger.info('ADMIN_USER_ACTION', logData);
  }

  /**
   * Log hoạt động CRUD trên product
   */
  static logProductAction(
    adminUser,
    action,
    productId,
    productName,
    changes = {},
    ip = null,
  ) {
    if (!adminUser) {
      console.error(
        'AdminAuditService.logProductAction: adminUser is undefined',
      );
      return;
    }

    const logData = {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminRole: adminUser.role,
      action,
      productId,
      productName,
      changes,
      timestamp: new Date().toISOString(),
      ip,
    };

    logger.info('ADMIN_PRODUCT_ACTION', logData);
  }

  /**
   * Log hoạt động trên order
   */
  static logOrderAction(
    adminUser,
    action,
    orderId,
    orderCode,
    changes = {},
    ip = null,
  ) {
    if (!adminUser) {
      console.error('AdminAuditService.logOrderAction: adminUser is undefined');
      return;
    }

    const logData = {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminRole: adminUser.role,
      action,
      orderId,
      orderCode,
      changes,
      timestamp: new Date().toISOString(),
      ip,
    };

    logger.info('ADMIN_ORDER_ACTION', logData);
  }

  /**
   * Log hoạt động xóa review
   */
  static logReviewAction(
    adminUser,
    action,
    reviewId,
    userId,
    productId,
    ip = null,
  ) {
    if (!adminUser) {
      console.error(
        'AdminAuditService.logReviewAction: adminUser is undefined',
      );
      return;
    }

    const logData = {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminRole: adminUser.role,
      action,
      reviewId,
      userId,
      productId,
      timestamp: new Date().toISOString(),
      ip,
    };

    logger.info('ADMIN_REVIEW_ACTION', logData);
  }

  /**
   * Log việc truy cập dashboard và thống kê
   */
  static logDashboardAccess(adminUser, endpoint, filters = {}, ip = null) {
    if (!adminUser) {
      console.error(
        'AdminAuditService.logDashboardAccess: adminUser is undefined',
      );
      return;
    }

    const logData = {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminRole: adminUser.role,
      action: 'DASHBOARD_ACCESS',
      endpoint,
      filters,
      timestamp: new Date().toISOString(),
      ip,
    };

    logger.info('ADMIN_DASHBOARD_ACCESS', logData);
  }

  /**
   * Log xác thực thất bại của admin
   */
  static logFailedAuth(email, reason, ip = null) {
    const logData = {
      email,
      reason,
      timestamp: new Date().toISOString(),
      ip,
    };

    logger.warn('ADMIN_AUTH_FAILED', logData);
  }

  /**
   * Log đăng nhập thành công của admin
   */
  static logSuccessfulLogin(adminUser, ip = null) {
    if (!adminUser) {
      console.error(
        'AdminAuditService.logSuccessfulLogin: adminUser is undefined',
      );
      return;
    }

    const logData = {
      adminId: adminUser.id,
      adminEmail: adminUser.email,
      adminRole: adminUser.role,
      action: 'LOGIN_SUCCESS',
      timestamp: new Date().toISOString(),
      ip,
    };

    logger.info('ADMIN_LOGIN_SUCCESS', logData);
  }
}

/**
 * Middleware để thêm IP vào audit logs
 */
const auditMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  const originalMethods = {
    logUserAction: AdminAuditService.logUserAction,
    logProductAction: AdminAuditService.logProductAction,
    logOrderAction: AdminAuditService.logOrderAction,
    logReviewAction: AdminAuditService.logReviewAction,
    logDashboardAccess: AdminAuditService.logDashboardAccess,
  };

  AdminAuditService.logUserAction = (
    adminUser,
    action,
    targetUserId,
    changes = {},
  ) => {
    return originalMethods.logUserAction(
      adminUser,
      action,
      targetUserId,
      changes,
      ip,
    );
  };

  AdminAuditService.logProductAction = (
    adminUser,
    action,
    productId,
    productName,
    changes = {},
  ) => {
    return originalMethods.logProductAction(
      adminUser,
      action,
      productId,
      productName,
      changes,
      ip,
    );
  };

  AdminAuditService.logOrderAction = (
    adminUser,
    action,
    orderId,
    orderCode,
    changes = {},
  ) => {
    return originalMethods.logOrderAction(
      adminUser,
      action,
      orderId,
      orderCode,
      changes,
      ip,
    );
  };

  AdminAuditService.logReviewAction = (
    adminUser,
    action,
    reviewId,
    userId,
    productId,
  ) => {
    return originalMethods.logReviewAction(
      adminUser,
      action,
      reviewId,
      userId,
      productId,
      ip,
    );
  };

  AdminAuditService.logDashboardAccess = (
    adminUser,
    endpoint,
    filters = {},
  ) => {
    return originalMethods.logDashboardAccess(adminUser, endpoint, filters, ip);
  };

  // Khôi phục các phương thức gốc sau khi xử lý xong request
  res.on('finish', () => {
    AdminAuditService.logUserAction = originalMethods.logUserAction;
    AdminAuditService.logProductAction = originalMethods.logProductAction;
    AdminAuditService.logOrderAction = originalMethods.logOrderAction;
    AdminAuditService.logReviewAction = originalMethods.logReviewAction;
    AdminAuditService.logDashboardAccess = originalMethods.logDashboardAccess;
  });

  next();
};

module.exports = {
  AdminAuditService,
  auditMiddleware,
};
