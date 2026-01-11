const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Wishlist Model.
 */
const Wishlist = sequelize.define(
  'Wishlist',
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
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'san_pham_id',
    },
  },
  {
    tableName: 'san_pham_yeu_thich',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['nguoi_dung_id', 'san_pham_id'],
      },
    ],
  },
);

module.exports = Wishlist;
