const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * ProductCategory Model.
 */
const ProductCategory = sequelize.define(
  'ProductCategory',
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
    categoryId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'danh_muc_id',
    },
  },
  {
    tableName: 'san_pham_danh_muc',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['san_pham_id', 'danh_muc_id'],
      },
    ],
  },
);

module.exports = ProductCategory;
