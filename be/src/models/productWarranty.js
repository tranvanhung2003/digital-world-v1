const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * ProductWarranty Model.
 */
const ProductWarranty = sequelize.define(
  'ProductWarranty',
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
    warrantyPackageId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'goi_bao_hanh_id',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'mac_dinh',
    },
  },
  {
    tableName: 'san_pham_goi_bao_hanh',
    timestamps: true,
  },
);

module.exports = ProductWarranty;
