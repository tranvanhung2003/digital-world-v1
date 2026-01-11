const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * ProductAttributeGroup Model.
 */
const ProductAttributeGroup = sequelize.define(
  'ProductAttributeGroup',
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
    attributeGroupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'nhom_thuoc_tinh_id',
    },
    isRequired: {
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
    tableName: 'san_pham_nhom_thuoc_tinh',
    timestamps: true,
  },
);

module.exports = ProductAttributeGroup;
