const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * WarrantyPackage Model.
 *
 * Thuộc tính "price" có giá trị tối thiểu là 0.
 *
 * Thuộc tính "terms" sử dụng JSONB để lưu trữ các điều khoản bảo hành phức tạp.
 *
 * Thuộc tính "coverage" sử dụng ARRAY để lưu trữ nhiều mục phạm vi bảo hành.
 */
const WarrantyPackage = sequelize.define(
  'WarrantyPackage',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_goi_bao_hanh',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'mo_ta',
    },
    durationMonths: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'so_thang_bao_hanh',
    },
    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      field: 'gia',
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    terms: {
      type: DataTypes.JSONB,
      defaultValue: {},
      field: 'dieu_khoan',
    },
    coverage: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
      field: 'pham_vi_bao_hanh',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'dang_hoat_dong',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'thu_tu_hien_thi',
    },
  },
  {
    tableName: 'goi_bao_hanh',
    timestamps: true,
  },
);

module.exports = WarrantyPackage;
