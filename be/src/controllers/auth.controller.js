const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const emailService = require('../services/email/emailService');

/**
 * Đăng ký người dùng mới
 */
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Kiểm tra nếu email đã tồn tại
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      throw new AppError('Email đã được sử dụng', 400);
    }

    // Tạo mã token xác thực email
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Tạo người dùng mới
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      verificationToken,
    });

    // Gửi email xác thực
    await emailService.sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      status: 'success',
      message:
        'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
    });
  } catch (error) {
    next(error);
  }
};

// Đăng nhập người dùng
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Tìm người dùng theo email
    const user = await User.findOne({ where: { email } });

    // Nếu không tìm thấy người dùng, trả về lỗi
    if (!user) {
      throw new AppError('Email hoặc mật khẩu không đúng', 401);
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Email hoặc mật khẩu không đúng', 401);
    }

    // Kiểm tra email đã được xác thực chưa
    if (!user.isEmailVerified) {
      throw new AppError('Vui lòng xác thực email trước khi đăng nhập', 401);
    }

    // Kiểm tra tài khoản có đang hoạt động không
    if (!user.isActive) {
      throw new AppError(
        'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên',
        401,
      );
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // Tạo refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
    );

    res.status(200).json({
      status: 'success',
      token,
      refreshToken,
      user: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// Đăng xuất người dùng
const logout = async (req, res, next) => {
  try {
    // Trong quá trình triển khai thực tế, có thể vô hiệu hóa token.
    // Bằng cách thêm nó vào blacklist hoặc sử dụng Redis để lưu trữ các token đã bị vô hiệu hóa.

    // Hiện tại, chỉ có cách trả về phản hồi 204 No Content.
    // Điều này sẽ yêu cầu client xóa token khỏi bộ nhớ của nó.
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Xác thực email với token (GET method)
const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Tìm user với token
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      throw new AppError('Token không hợp lệ hoặc đã hết hạn', 400);
    }

    // Cập nhật user
    user.isEmailVerified = true;
    user.verificationToken = null;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.',
    });
  } catch (error) {
    next(error);
  }
};

// Xác thực email với token (POST method)
const verifyEmailWithToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Tìm user với token
    const user = await User.findOne({ where: { verificationToken: token } });

    if (!user) {
      throw new AppError('Token không hợp lệ hoặc đã hết hạn', 400);
    }

    // Cập nhật user
    user.isEmailVerified = true;
    user.verificationToken = null;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Xác thực email thành công. Bạn có thể đăng nhập ngay bây giờ.',
    });
  } catch (error) {
    next(error);
  }
};

// Gửi lại email xác thực
const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Tìm user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError('Không tìm thấy tài khoản với email này', 404);
    }

    // Kiểm tra email đã được xác thực chưa
    if (user.isEmailVerified) {
      throw new AppError('Email đã được xác thực', 400);
    }

    // Tạo token xác thực mới
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Cập nhật user
    user.verificationToken = verificationToken;

    await user.save();

    // Gửi lại email xác thực
    await emailService.sendVerificationEmail(user.email, verificationToken);

    res.status(200).json({
      status: 'success',
      message: 'Đã gửi lại email xác thực. Vui lòng kiểm tra email của bạn.',
    });
  } catch (error) {
    next(error);
  }
};

// Làm mới token
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    // Kiểm tra refresh token có tồn tại không
    if (!refreshToken) {
      throw new AppError('Refresh token là bắt buộc', 401);
    }

    // Xác minh refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Tìm user
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new AppError('Refresh token không hợp lệ', 401);
    }

    // Kiểm tra tài khoản có đang hoạt động không
    if (!user.isActive) {
      throw new AppError(
        'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên',
        401,
      );
    }

    // Tạo access token mới
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return next(
        new AppError('Refresh token không hợp lệ hoặc đã hết hạn', 401),
      );
    }
    next(error);
  }
};

// Quên mật khẩu
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Tìm user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new AppError('Không tìm thấy tài khoản với email này', 404);
    }

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = Date.now() + 3600000; // 1 hour

    // Cập nhật user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpires);
    await user.save();

    // Gửi email đặt lại mật khẩu
    await emailService.sendResetPasswordEmail(user.email, resetToken);

    res.status(200).json({
      status: 'success',
      message:
        'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra email của bạn.',
    });
  } catch (error) {
    next(error);
  }
};

const { Op } = require('sequelize');

/**
 * Đặt lại mật khẩu
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Tìm user với token và kiểm tra thời gian hết hạn
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      // Thêm debugging logs giúp xác định vấn đề
      console.log('Reset password token:', token);

      const debugUser = await User.findOne({
        where: { resetPasswordToken: token },
      });

      if (debugUser) {
        console.log('Đã tìm thấy user với token nhưng đã hết hạn:', {
          resetPasswordExpires: debugUser.resetPasswordExpires,
          currentDate: new Date(),
          isExpired: debugUser.resetPasswordExpires < new Date(),
        });
      } else {
        console.log('Không tìm thấy user với token được cung cấp.');
      }

      throw new AppError('Token không hợp lệ hoặc đã hết hạn', 400);
    }

    // Cập nhật user
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      status: 'success',
      message:
        'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập ngay bây giờ.',
    });
  } catch (error) {
    next(error);
  }
};

// Lấy thông tin người dùng hiện tại
const getCurrentUser = async (req, res, next) => {
  try {
    // Tìm user theo ID từ token
    const user = await User.findByPk(req.user.id, {
      include: [
        {
          association: 'addresses',
          attributes: { exclude: ['userId'] },
        },
      ],
    });

    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    res.status(200).json({
      status: 'success',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  verifyEmailWithToken,
  resendVerification,
  refreshToken,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};
