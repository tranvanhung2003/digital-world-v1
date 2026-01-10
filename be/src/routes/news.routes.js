const express = require('express');
const router = express.Router();
const newsController = require('../controllers/news.controller');
const { authenticate } = require('../middlewares/authenticate');
const { authorize } = require('../middlewares/authorize');

// PUBLIC ROUTES

router.get(
  '/', // GET /api/news - Lấy tất cả tin tức với phân trang và lọc
  newsController.getAllNews,
);
router.get(
  '/slug/:slug', // GET /api/news/slug/:slug - Lấy tin tức theo slug
  newsController.getNewsBySlug,
);
router.get(
  '/slug/:slug/related', // GET /api/news/slug/:slug/related - Lấy tin tức liên quan
  newsController.getRelatedNews,
);
router.get(
  '/:id', // GET /api/news/:id - Lấy tin tức theo ID
  newsController.getNewsById,
);

// ADMIN ROUTES

router.post(
  '/', // POST /api/news - Tạo tin tức mới (Admin)
  authenticate,
  authorize('admin'),
  newsController.createNews,
);

router.put(
  '/:id', // PUT /api/news/:id - Cập nhật tin tức (Admin)
  authenticate,
  authorize('admin'),
  newsController.updateNews,
);

router.delete(
  '/:id', // DELETE /api/news/:id - Xóa tin tức (Admin)
  authenticate,
  authorize('admin'),
  newsController.deleteNews,
);

module.exports = router;
