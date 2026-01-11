const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * ProductSpecification Model.
 */
const ProductSpecification = sequelize.define(
  'ProductSpecification',
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
      field: 'ten_thong_so_ky_thuat',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'gia_tri_thong_so_ky_thuat',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'danh_muc',
      defaultValue: 'General',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'thu_tu_hien_thi',
    },
  },
  {
    tableName: 'san_pham_thong_so_ky_thuat',
    timestamps: true,
  },
);

module.exports = ProductSpecification;
