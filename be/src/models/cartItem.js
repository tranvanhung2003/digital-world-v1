const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * CartItem Model.
 *
 * Thuộc tính "warrantyPackageIds" sử dụng mảng để lưu trữ nhiều ID gói bảo hành.
 */
const CartItem = sequelize.define(
  'CartItem',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cartId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'gio_hang_id',
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'so_luong',
      defaultValue: 1,
      validate: {
        min: 1,
      },
    },
    price: {
      type: DataTypes.DECIMAL(19, 2),
      allowNull: false,
      field: 'gia',
      validate: {
        min: 0,
      },
    },
    warrantyPackageIds: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      allowNull: true,
      field: 'goi_bao_hanh_ids',
      defaultValue: [],
    },
  },
  {
    tableName: 'chi_tiet_gio_hang',
    timestamps: true,
  },
);

module.exports = CartItem;
