const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * NewsletterSubscriber Model.
 *
 * Thuộc tính "status" sử dụng ENUM("active", "unsubscribed")
 * để theo dõi trạng thái đăng ký của người dùng.
 */
const NewsletterSubscriber = sequelize.define(
  'NewsletterSubscriber',
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
    status: {
      type: DataTypes.ENUM('active', 'unsubscribed'),
      defaultValue: 'active',
      field: 'trang_thai',
    },
  },
  {
    tableName: 'nguoi_dang_ky_ban_tin',
    timestamps: true,
  },
);

module.exports = NewsletterSubscriber;
