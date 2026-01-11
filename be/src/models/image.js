const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Image Model.
 *
 * Thuộc tính "category" sử dụng ENUM("product", "thumbnail", "user", "review")
 * để phân loại hình ảnh theo mục đích sử dụng.
 */
const Image = sequelize.define(
  'Image',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'ten_goc',
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: 'ten_file',
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'duong_dan_file',
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'kich_thuoc_file',
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'loai_mime',
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'chieu_rong',
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'chieu_cao',
    },
    category: {
      type: DataTypes.ENUM('product', 'thumbnail', 'user', 'review'),
      allowNull: false,
      field: 'danh_muc',
      defaultValue: 'product',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'san_pham_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'nguoi_dung_id',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'dang_hoat_dong',
    },
  },
  {
    tableName: 'hinh_anh',
    timestamps: true,
    indexes: [
      {
        fields: ['san_pham_id'],
      },
      {
        fields: ['nguoi_dung_id'],
      },
      {
        fields: ['danh_muc'],
      },
      {
        fields: ['dang_hoat_dong'],
      },
    ],
  },
);

module.exports = Image;
