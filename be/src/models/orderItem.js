const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * OrderItem Model.
 *
 * Thuộc tính "attributes" sử dụng JSONB
 * để lưu trữ các thuộc tính tùy chỉnh của sản phẩm trong đơn hàng.
 */
const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'don_hang_id',
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'san_pham_id',
    },
    variantId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'bien_the_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_san_pham',
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ma_sku',
    },
    price: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      field: 'gia',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'so_luong',
    },
    subtotal: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      field: 'tong_phu',
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'hinh_anh',
    },
    attributes: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'thuoc_tinh',
    },
  },
  {
    tableName: 'chi_tiet_don_hang',
    timestamps: true,
  },
);

module.exports = OrderItem;
