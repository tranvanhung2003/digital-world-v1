const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Address Model.
 */
const Address = sequelize.define(
  'Address',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'nguoi_dung_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ten_nguoi_nhan',
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten',
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ho',
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'cong_ty',
    },
    address1: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'dia_chi_1',
    },
    address2: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'dia_chi_2',
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'quan_huyen',
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'tinh_thanh',
    },
    zip: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ma_buu_dien',
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'quoc_gia',
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'so_dien_thoai',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'mac_dinh',
    },
  },
  {
    tableName: 'dia_chi',
    timestamps: true,
  },
);

module.exports = Address;
