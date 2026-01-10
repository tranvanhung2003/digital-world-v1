const { User, Address } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Cập nhật thông tin cá nhân
 */
const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;
    const userId = req.user.id;

    // Tìm người dùng
    const user = await User.findByPk(userId);

    // Nếu không tìm thấy người dùng, trả về lỗi
    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    // Cập nhật thông tin người dùng
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.phone = phone !== undefined ? phone : user.phone;
    user.avatar = avatar || user.avatar;

    // Lưu thay đổi
    await user.save();

    res.status(200).json({
      status: 'success',
      data: user.toJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đổi mật khẩu
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Tìm người dùng
    const user = await User.findByPk(userId);

    // Nếu không tìm thấy người dùng, trả về lỗi
    if (!user) {
      throw new AppError('Không tìm thấy người dùng', 404);
    }

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);

    // Nếu mật khẩu không đúng, trả về lỗi
    if (!isMatch) {
      throw new AppError('Mật khẩu hiện tại không đúng', 401);
    }

    // Cập nhật mật khẩu
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Đổi mật khẩu thành công',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách địa chỉ
 */
const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Tìm địa chỉ của người dùng
    const addresses = await Address.findAll({
      where: { userId },
      order: [
        ['isDefault', 'DESC'],
        ['createdAt', 'DESC'],
      ],
    });

    res.status(200).json({
      status: 'success',
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Thêm địa chỉ mới
 */
const addAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addressData = req.body;

    // Đếm số địa chỉ hiện có của người dùng
    const addressCount = await Address.count({ where: { userId } });

    // Nếu chưa có địa chỉ nào, đặt địa chỉ mới là mặc định
    if (addressCount === 0) {
      addressData.isDefault = true;
    }

    // Nếu đặt địa chỉ mới này là mặc định, thì cập nhật địa chỉ mặc định cũ là false
    if (addressData.isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId, isDefault: true } },
      );
    }

    // Tạo địa chỉ mới
    const address = await Address.create({
      ...addressData,
      userId,
    });

    res.status(201).json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật địa chỉ
 */
const updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const addressData = req.body;

    // Tìm địa chỉ
    const address = await Address.findOne({
      where: { id, userId },
    });

    // Nếu không tìm thấy địa chỉ, trả về lỗi
    if (!address) {
      throw new AppError('Không tìm thấy địa chỉ', 404);
    }

    // Nếu đặt địa chỉ này là mặc định, thì cập nhật địa chỉ mặc định cũ là false
    if (addressData.isDefault && !address.isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId, isDefault: true } },
      );
    }

    // Cập nhật địa chỉ
    await address.update(addressData);

    res.status(200).json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa địa chỉ
 */
const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Tìm địa chỉ
    const address = await Address.findOne({
      where: { id, userId },
    });

    // Nếu không tìm thấy địa chỉ, trả về lỗi
    if (!address) {
      throw new AppError('Không tìm thấy địa chỉ', 404);
    }

    // Xóa địa chỉ
    await address.destroy();

    // Nếu địa chỉ bị xóa là mặc định, đặt một địa chỉ khác làm mặc định (địa chỉ mới nhất)
    if (address.isDefault) {
      const anotherAddress = await Address.findOne({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });

      if (anotherAddress) {
        anotherAddress.isDefault = true;
        await anotherAddress.save();
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Xóa địa chỉ thành công',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Đặt địa chỉ mặc định
 */
const setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Tìm địa chỉ
    const address = await Address.findOne({
      where: { id, userId },
    });

    // Nếu không tìm thấy địa chỉ, trả về lỗi
    if (!address) {
      throw new AppError('Không tìm thấy địa chỉ', 404);
    }

    // Cập nhật địa chỉ mặc định cũ thành false
    await Address.update(
      { isDefault: false },
      { where: { userId, isDefault: true } },
    );

    // Đặt địa chỉ này thành mặc định
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      status: 'success',
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateProfile,
  changePassword,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
