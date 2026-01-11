const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * News Model.
 */
const News = sequelize.define(
  'News',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'tieu_de',
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'slug',
      unique: true,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'noi_dung',
    },
    thumbnail: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'thumbnail',
    },
    // Mô tả ngắn gọn về tin tức
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'mo_ta',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'danh_muc',
      defaultValue: 'Tin tức',
    },
    viewCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'luot_xem',
    },
    // Danh sách từ khóa liên quan đến tin tức, lưu dưới dạng chuỗi phân cách bằng dấu phẩy
    tags: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'tu_khoa',
    },
    isPublished: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'da_xuat_ban',
    },
    // Thuộc tính tùy chọn để liên kết tin tức với người dùng (tác giả)
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'nguoi_dung_id',
    },
  },
  {
    tableName: 'tin_tuc',
    timestamps: true,
  },
);

module.exports = News;
