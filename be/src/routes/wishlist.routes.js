const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlist.controller');
const { authenticate } = require('../middlewares/authenticate');

// TẤT CẢ CÁC ROUTE ĐỀU YÊU CẦU XÁC THỰC NGƯỜI DÙNG
router.use(authenticate);

// WISHLIST ROUTES

router.get(
  '/', // GET /api/wishlist - Lấy danh sách yêu thích
  wishlistController.getWishlist,
);
router.post(
  '/', // POST /api/wishlist - Thêm sản phẩm vào danh sách yêu thích
  wishlistController.addToWishlist,
);
router.get(
  '/check/:productId', // GET /api/wishlist/check/:productId - Kiểm tra sản phẩm có trong danh sách yêu thích hay không
  wishlistController.checkWishlist,
);
router.delete(
  '/:productId', // DELETE /api/wishlist/:productId - Xóa sản phẩm khỏi danh sách yêu thích
  wishlistController.removeFromWishlist,
);
router.delete(
  '/', // DELETE /api/wishlist - Xóa tất cả sản phẩm trong danh sách yêu thích
  wishlistController.clearWishlist,
);

module.exports = router;
