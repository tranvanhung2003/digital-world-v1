const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * ReviewFeedback Model.
 */
const ReviewFeedback = sequelize.define(
  'ReviewFeedback',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reviewId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'danh_gia_id',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'nguoi_dung_id',
    },
    isHelpful: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: 'co_huu_ich',
    },
  },
  {
    tableName: 'danh_gia_phan_hoi',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['danh_gia_id', 'nguoi_dung_id'],
      },
    ],
  },
);

module.exports = ReviewFeedback;
