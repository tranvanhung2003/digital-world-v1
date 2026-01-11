const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/sequelize');

/**
 * User Model.
 *
 * Thuộc tính "role" sử dụng ENUM("customer", "admin", "manager")
 * để xác định vai trò của người dùng trong hệ thống.
 *
 * Sử dụng hook beforeCreate và beforeUpdate để băm mật khẩu
 * trước khi lưu vào cơ sở dữ liệu, đảm bảo an toàn cho mật khẩu người dùng.
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'email',
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'mat_khau',
      validate: {
        len: [6, 100],
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_nguoi_dung',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ho_nguoi_dung',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'so_dien_thoai',
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'anh_dai_dien',
    },
    role: {
      type: DataTypes.ENUM('customer', 'admin', 'manager'),
      defaultValue: 'customer',
      field: 'vai_tro',
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'da_xac_minh_email',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'dang_hoat_dong',
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ma_xac_minh_email',
    },
    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ma_dat_lai_mat_khau',
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'het_han_dat_lai_mat_khau',
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'khach_hang_stripe_id',
    },
  },
  {
    tableName: 'nguoi_dung',
    timestamps: true,
    hooks: {
      // Sử dụng hook beforeCreate và beforeUpdate để băm mật khẩu trước khi lưu vào cơ sở dữ liệu
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);

          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);

          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  },
);

// Các phương thức instance để so sánh mật khẩu và loại bỏ các trường nhạy cảm khi trả về JSON
User.prototype.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function () {
  const values = { ...this.get() };
  delete values.password;
  delete values.verificationToken;
  delete values.resetPasswordToken;
  delete values.resetPasswordExpires;
  return values;
};

module.exports = User;
