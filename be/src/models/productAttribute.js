const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * ProductAttribute Model.
 *
 * Thuộc tính "type" sử dụng ENUM("color", "size", "material", "custom")
 * để xác định loại thuộc tính sản phẩm.
 *
 * Thuộc tính "values" sử dụng JSONB
 * để lưu trữ danh sách các giá trị thuộc tính sản phẩm.
 */
const ProductAttribute = sequelize.define(
  'ProductAttribute',
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_thuoc_tinh',
    },
    type: {
      type: DataTypes.ENUM('color', 'size', 'material', 'custom'),
      allowNull: false,
      field: 'loai_thuoc_tinh',
      defaultValue: 'custom',
    },
    values: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'gia_tri_thuoc_tinh',
      defaultValue: [],
    },
    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'bat_buoc',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'thu_tu_hien_thi',
    },
  },
  {
    tableName: 'thuoc_tinh',
    timestamps: true,
  },
);

module.exports = ProductAttribute;
