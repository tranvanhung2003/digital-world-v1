const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Review Model.
 *
 * Thuộc tính "rating" được giới hạn từ 1 đến 5.
 *
 * Thuộc tính "images" sử dụng ARRAY để lưu trữ nhiều URL hình ảnh.
 */
const Review = sequelize.define(
  'Review',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'san_pham_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'nguoi_dung_id',
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'muc_danh_gia',
      validate: {
        min: 1,
        max: 5,
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tieu_de',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'noi_dung',
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'da_xac_minh',
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'luot_thich',
    },
    dislikes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'luot_khong_thich',
    },
    images: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      field: 'hinh_anh',
    },
  },
  {
    tableName: 'danh_gia',
    timestamps: true,
  },
);

module.exports = Review;
