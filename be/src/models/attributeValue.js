const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * AttributeValue Model.
 *
 * Thuộc tính "colorCode" có validate để đảm bảo định dạng mã màu hex.
 */
const AttributeValue = sequelize.define(
  'AttributeValue',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    attributeGroupId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'nhom_thuoc_tinh_id',
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_gia_tri_thuoc_tinh',
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'gia_tri_thuoc_tinh',
    },
    colorCode: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'ma_mau',
      validate: {
        isValidColor(value) {
          if (value && !/^#[0-9A-F]{6}$/i.test(value)) {
            throw new Error('Mã màu phải ở định dạng hex (ví dụ: #FF0000)');
          }
        },
      },
    },
    imageUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'url_hinh_anh',
    },
    priceAdjustment: {
      type: DataTypes.DECIMAL(12, 2),
      defaultValue: 0,
      field: 'chinh_sua_gia',
    },
    sortOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'thu_tu_hien_thi',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'dang_hoat_dong',
    },
    // Thuộc tính affectsName xác định xem giá trị thuộc tính này có ảnh hưởng đến tên sản phẩm hay không
    affectsName: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'anh_huong_ten_san_pham',
    },
    // Thuộc tính nameTemplate lưu trữ mẫu tên sản phẩm liên quan đến giá trị thuộc tính
    nameTemplate: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'mau_ten_san_pham',
      comment: 'Template for product name (e.g., "I9", "RTX 4080", "32GB")',
    },
  },
  {
    tableName: 'gia_tri_thuoc_tinh',
    timestamps: true,
  },
);

module.exports = AttributeValue;
