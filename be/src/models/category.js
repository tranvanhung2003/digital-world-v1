const { DataTypes } = require('sequelize');
const slugify = require('slugify');
const sequelize = require('../config/sequelize');

/**
 * Category Model.
 *
 * Sử dụng hook beforeValidate để tự động tạo slug (thuộc tính "slug")
 * từ tên danh mục (thuộc tính "name") trước khi lưu vào cơ sở dữ liệu.
 */
const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'ten_danh_muc',
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'slug',
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'mo_ta',
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'hinh_anh',
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'danh_muc_cha_id',
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'cap_do',
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
    tableName: 'danh_muc',
    timestamps: true,
    hooks: {
      // Sử dụng hook beforeValidate để tự động tạo slug (thuộc tính "slug")
      // từ tên danh mục (thuộc tính "name") trước khi lưu vào cơ sở dữ liệu.
      beforeValidate: (category) => {
        if (category.name) {
          category.slug = slugify(category.name, {
            lower: true,
            strict: true,
          });
        }
      },
    },
  },
);

module.exports = Category;
