const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * AttributeGroup Model.
 *
 * Thuộc tính "type" có validate để chỉ chấp nhận các giá trị: "color", "config", "storage", "size", "custom".
 */
const AttributeGroup = sequelize.define(
  'AttributeGroup',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_nhom_thuoc_tinh',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'mo_ta',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'loai_thuoc_tinh',
      defaultValue: 'custom',
      validate: {
        isIn: [['color', 'config', 'storage', 'size', 'custom']],
      },
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      field: 'bat_buoc',
      defaultValue: false,
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      field: 'thu_tu_hien_thi',
      defaultValue: 0,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      field: 'dang_hoat_dong',
      defaultValue: true,
    },
  },
  {
    tableName: 'nhom_thuoc_tinh',
    timestamps: true,
  },
);

module.exports = AttributeGroup;
