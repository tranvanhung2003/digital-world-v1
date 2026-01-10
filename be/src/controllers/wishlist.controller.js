const { Wishlist, Product } = require('../models');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Lấy danh sách yêu thích
 */
const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const wishlistItems = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          attributes: [
            'id',
            'name',
            'slug',
            'price',
            'compareAtPrice',
            'thumbnail',
            'inStock',
            'stockQuantity',
          ],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      status: 'success',
      data: wishlistItems.map((item) => item.Product),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Thêm sản phẩm vào danh sách yêu thích
 */
const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    // Kiểm tra sản phẩm có tồn tại không
    const product = await Product.findByPk(productId);

    // Nếu không tồn tại, trả về lỗi
    if (!product) {
      throw new AppError('Sản phẩm không tồn tại', 404);
    }

    // Kiểm tra sản phẩm đã có trong danh sách yêu thích chưa
    const existingItem = await Wishlist.findOne({
      where: { userId, productId },
    });

    // Nếu đã có, trả về thông báo
    if (existingItem) {
      return res.status(200).json({
        status: 'success',
        message: 'Sản phẩm đã có trong danh sách yêu thích',
      });
    }

    // Thêm sản phẩm vào danh sách yêu thích
    await Wishlist.create({
      userId,
      productId,
    });

    res.status(201).json({
      status: 'success',
      message: 'Đã thêm sản phẩm vào danh sách yêu thích',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa sản phẩm khỏi danh sách yêu thích
 */
const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Kiểm tra sản phẩm có trong danh sách yêu thích không
    const wishlistItem = await Wishlist.findOne({
      where: { userId, productId },
    });

    // Nếu không có, trả về lỗi
    if (!wishlistItem) {
      throw new AppError('Sản phẩm không có trong danh sách yêu thích', 404);
    }

    // Xóa sản phẩm khỏi danh sách yêu thích
    await wishlistItem.destroy();

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa sản phẩm khỏi danh sách yêu thích',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Kiểm tra sản phẩm có trong danh sách yêu thích hay không
 */
const checkWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Kiểm tra sản phẩm có trong danh sách yêu thích hay không
    const wishlistItem = await Wishlist.findOne({
      where: { userId, productId },
    });

    res.status(200).json({
      status: 'success',
      data: {
        inWishlist: !!wishlistItem,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Xóa tất cả sản phẩm trong danh sách yêu thích
 */
const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Xóa tất cả sản phẩm trong danh sách yêu thích của người dùng
    await Wishlist.destroy({
      where: { userId },
    });

    res.status(200).json({
      status: 'success',
      message: 'Đã xóa tất cả sản phẩm trong danh sách yêu thích',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist,
};
