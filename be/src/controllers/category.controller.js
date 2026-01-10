const { Category, Product, sequelize, ProductCategory } = require('../models');
const { AppError } = require('../middlewares/errorHandler');
const { Op } = require('sequelize');
const { getTableName, getField } = require('../utils/helpers');

/**
 * Lấy tất cả danh mục
 */
const getAllCategories = async (req, res, next) => {
  try {
    // Lấy danh sách danh mục
    const categories = await Category.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    const productCategoryTableName = getTableName(ProductCategory);
    const ProductCategory_categoryId = getField(ProductCategory, 'categoryId');
    const ProductCategory_productId = getField(ProductCategory, 'productId');

    // Lấy số lượng sản phẩm cho mỗi danh mục
    const categoryCounts = await sequelize.query(
      `
      SELECT 
        ${ProductCategory_categoryId}, 
        COUNT(DISTINCT ${ProductCategory_productId}) as product_count 
      FROM 
        ${productCategoryTableName} 
      GROUP BY 
        ${ProductCategory_categoryId}
    `,
      { type: sequelize.QueryTypes.SELECT, logging: console.log },
    );

    // Tạo map từ category_id đến product_count
    const countMap = {};
    categoryCounts.forEach((item) => {
      countMap[item[ProductCategory_categoryId]] = parseInt(item.product_count);
    });

    // Thêm productCount vào mỗi danh mục
    const categoriesWithCount = categories.map((category) => {
      const categoryData = category.toJSON();

      categoryData.productCount = countMap[category.id] || 0;

      return categoryData;
    });

    res.status(200).json({
      status: 'success',
      data: categoriesWithCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy cây danh mục
 */
const getCategoryTree = async (req, res, next) => {
  try {
    // Lấy tất cả danh mục
    const allCategories = await Category.findAll({
      where: { isActive: true },
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    // Xây dựng cấu trúc cây
    const rootCategories = [];
    const categoryMap = {};

    // Tạo map các danh mục
    allCategories.forEach((category) => {
      categoryMap[category.id] = {
        ...category.toJSON(),
        children: [],
      };
    });

    // Xây dựng cây danh mục
    allCategories.forEach((category) => {
      if (category.parentId) {
        // Nếu có danh mục cha, thêm nó vào con của danh mục cha
        if (categoryMap[category.parentId]) {
          categoryMap[category.parentId].children.push(
            categoryMap[category.id],
          );
        }
      } else {
        // Nếu không có danh mục cha, đó là danh mục gốc
        rootCategories.push(categoryMap[category.id]);
      }
    });

    res.status(200).json({
      status: 'success',
      data: rootCategories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh mục theo ID
 */
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          association: 'parent',
          attributes: ['id', 'name', 'slug'],
        },
        {
          association: 'children',
          attributes: ['id', 'name', 'slug', 'image'],
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!category) {
      throw new AppError('Không tìm thấy danh mục', 404);
    }

    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh mục theo slug
 */
const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug },
      include: [
        {
          association: 'parent',
          attributes: ['id', 'name', 'slug'],
        },
        {
          association: 'children',
          attributes: ['id', 'name', 'slug', 'image'],
          where: { isActive: true },
          required: false,
        },
      ],
    });

    if (!category) {
      throw new AppError('Không tìm thấy danh mục', 404);
    }

    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tạo danh mục mới (Admin)
 */
const createCategory = async (req, res, next) => {
  try {
    const { name, description, image, parentId, isActive, sortOrder } =
      req.body;

    // Nếu có danh mục cha, kiểm tra xem nó có tồn tại không
    if (parentId) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        throw new AppError('Danh mục cha không tồn tại', 400);
      }
    }

    // Tạo danh mục
    const category = await Category.create({
      name,
      description,
      image,
      parentId,
      isActive,
      sortOrder,
      level: parentId ? 2 : 1, // Nếu có danh mục cha thì level = 2, ngược lại = 1
    });

    res.status(201).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cập nhật danh mục (Admin)
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image, parentId, isActive, sortOrder } =
      req.body;

    // Tìm danh mục
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('Không tìm thấy danh mục', 404);
    }

    // Nếu parentId được cung cấp và khác với parentId hiện tại của danh mục
    // thì mới tiến hành kiểm tra và cập nhật
    if (parentId && parentId !== category.parentId) {
      // Kiểm tra để tránh việc một danh mục trở thành cha của chính nó
      if (parentId === id) {
        throw new AppError(
          'Danh mục không thể là danh mục cha của chính nó',
          400,
        );
      }

      // Kiểm tra xem danh mục cha có tồn tại không
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        throw new AppError('Danh mục cha không tồn tại', 400);
      }

      // Kiểm tra để đảm bảo danh mục cha không phải là con của danh mục hiện tại (tránh tham chiếu vòng)
      const childCategories = await Category.findAll({
        where: { parentId: id },
      });
      const childIds = childCategories.map((child) => child.id);
      if (childIds.includes(parentId)) {
        throw new AppError('Không thể chọn danh mục con làm danh mục cha', 400);
      }
    }

    // Cập nhật chỉ những trường được cung cấp trong req.body
    await category.update({
      name: name !== undefined ? name : category.name,
      description:
        description !== undefined ? description : category.description,
      image: image !== undefined ? image : category.image,
      parentId: parentId !== undefined ? parentId : category.parentId,
      isActive: isActive !== undefined ? isActive : category.isActive,
      sortOrder: sortOrder !== undefined ? sortOrder : category.sortOrder,
      level: parentId ? 2 : 1, // Nếu có danh mục cha thì level = 2, ngược lại = 1
    });

    res.status(200).json({
      status: 'success',
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa danh mục (Admin)
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Tìm danh mục
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('Không tìm thấy danh mục', 404);
    }

    // Kiểm tra xem danh mục có danh mục con không
    const childCategories = await Category.findAll({
      where: { parentId: id },
    });

    // Nếu có danh mục con, không cho phép xóa
    if (childCategories.length > 0) {
      throw new AppError('Không thể xóa danh mục có danh mục con', 400);
    }

    // Kiểm tra xem danh mục có sản phẩm không
    const productCount = await Product.count({
      include: [
        {
          association: 'categories',
          where: { id },
          required: true,
        },
      ],
    });

    // Nếu có sản phẩm, không cho phép xóa
    if (productCount > 0) {
      throw new AppError('Không thể xóa danh mục có sản phẩm', 400);
    }

    // Xóa danh mục
    await category.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Xóa danh mục thành công',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy sản phẩm theo danh mục
 */
const getProductsByCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'DESC',
    } = req.query;

    // Tìm danh mục
    const category = await Category.findByPk(id);
    if (!category) {
      throw new AppError('Không tìm thấy danh mục', 404);
    }

    // Lấy tất cả danh mục con
    const childCategories = await Category.findAll({
      where: { parentId: id },
    });

    // Tạo mảng ID danh mục bao gồm cả danh mục hiện tại và tất cả danh mục con
    const categoryIds = [id, ...childCategories.map((cat) => cat.id)];

    // Lấy các sản phẩm thuộc về các danh mục trong categoryIds
    const { count, rows: products } = await Product.findAndCountAll({
      include: [
        {
          association: 'categories',
          where: { id: { [Op.in]: categoryIds } },
          through: { attributes: [] },
        },
      ],
      distinct: true,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sort, order]],
    });

    res.status(200).json({
      status: 'success',
      data: {
        total: count,
        pages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        products,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy các danh mục nổi bật
 */
const getFeaturedCategories = async (req, res, next) => {
  try {
    // Lấy các danh mục nổi bật (nghĩa là các danh mục có sản phẩm nổi bật)
    const categories = await Category.findAll({
      include: [
        {
          association: 'products',
          where: { featured: true },
          through: { attributes: [] },
          required: true,
        },
      ],
      where: { isActive: true },
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC'],
      ],
    });

    // Nếu không tìm thấy danh mục nổi bật, trả về các danh mục top-level
    if (categories.length === 0) {
      const topCategories = await Category.findAll({
        where: {
          isActive: true,
          parentId: null,
        },
        limit: 5,
        order: [
          ['sortOrder', 'ASC'],
          ['name', 'ASC'],
        ],
      });

      return res.status(200).json({
        status: 'success',
        data: topCategories,
      });
    }

    res.status(200).json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryTree,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getProductsByCategory,
  getFeaturedCategories,
};
