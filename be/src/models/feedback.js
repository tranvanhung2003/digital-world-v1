const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Feedback Model.
 *
 * Thuộc tính "status" sử dụng ENUM("pending", "reviewed", "resolved")
 * để giới hạn các trạng thái phản hồi.
 */
const Feedback = sequelize.define(
  'Feedback',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_nguoi_gui',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'email_nguoi_gui',
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'so_dien_thoai',
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'tieu_de',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'noi_dung',
    },
    status: {
      type: DataTypes.ENUM('pending', 'reviewed', 'resolved'),
      defaultValue: 'pending',
      field: 'trang_thai',
    },
  },
  {
    tableName: 'phan_hoi',
    timestamps: true,
  },
);

module.exports = Feedback;
