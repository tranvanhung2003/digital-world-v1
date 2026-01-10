const { News, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Lấy tất cả tin tức với phân trang và lọc
 */
const getAllNews = async (req, res) => {
  try {
    // Lấy tham số phân trang và lọc từ query
    const { page = 1, limit = 10, search, isPublished, category } = req.query;

    // Tính toán offset
    const offset = (page - 1) * limit;

    const where = {};

    if (search) {
      where.title = { [Op.like]: `%${search}%` };
    }
    if (isPublished !== undefined) {
      where.isPublished = isPublished === 'true';
    }
    if (category && category !== 'Tất cả') {
      where.category = category;
    }

    const { count, rows } = await News.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'avatar', 'email'],
        },
      ],
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      news: rows,
    });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả tin tức:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Lấy tin tức theo slug
 */
const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    // Tìm tin tức theo slug
    const news = await News.findOne({
      where: { slug },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      ],
    });

    // Nếu không tìm thấy tin tức, trả về lỗi 404
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy tin tức' });
    }

    // Tăng viewCount lên 1
    await news.increment('viewCount');

    res.json({ success: true, news });
  } catch (error) {
    console.error('Lỗi khi lấy tin tức theo slug:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Lấy tin tức liên quan
 */
const getRelatedNews = async (req, res) => {
  try {
    const { slug } = req.params;

    // Lấy tin tức hiện tại để tìm danh mục và ID của nó
    const currentNews = await News.findOne({
      where: { slug },
      attributes: ['id', 'category'],
    });

    // Nếu không tìm thấy tin tức hiện tại, trả về lỗi 404
    if (!currentNews) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy tin tức hiện tại' });
    }

    // Tìm các tin tức cùng danh mục, không bao gồm tin tức hiện tại
    let relatedNews = await News.findAll({
      where: {
        category: currentNews.category,
        id: { [Op.ne]: currentNews.id }, // Loại trừ tin tức hiện tại
        isPublished: true,
      },
      limit: 3,
      order: [['createdAt', 'DESC']], // Có thể dùng sequelize.random() để đa dạng hơn
      attributes: [
        'id',
        'title',
        'slug',
        'thumbnail',
        'category',
        'createdAt',
        'viewCount',
      ],
    });

    // Dự phòng: Nếu không đủ tin tức liên quan, hãy điền tin tức mới nhất
    if (relatedNews.length < 3) {
      // Số tin tức cần thêm
      const needed = 3 - relatedNews.length;

      // Lấy ID của các tin tức đã có để tránh trùng lặp
      const existingIds = [currentNews.id, ...relatedNews.map((n) => n.id)];

      // Tìm thêm tin tức mới nhất không nằm trong danh sách existingIds
      const moreNews = await News.findAll({
        where: {
          id: { [Op.notIn]: existingIds },
          isPublished: true,
        },
        limit: needed,
        order: [['createdAt', 'DESC']],
        attributes: [
          'id',
          'title',
          'slug',
          'thumbnail',
          'category',
          'createdAt',
          'viewCount',
        ],
      });

      // Kết hợp tin tức liên quan ban đầu với tin tức bổ sung
      relatedNews = [...relatedNews, ...moreNews];
    }

    res.json({ success: true, news: relatedNews });
  } catch (error) {
    console.error('Lỗi khi lấy tin tức liên quan:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Lấy tin tức theo ID
 */
const getNewsById = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm tin tức theo ID
    const news = await News.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
        },
      ],
    });

    // Nếu không tìm thấy tin tức, trả về lỗi 404
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy tin tức' });
    }

    res.json({ success: true, news });
  } catch (error) {
    console.error('Lỗi khi lấy tin tức theo ID:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Tạo tin tức mới (Admin)
 */
const createNews = async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      thumbnail,
      description,
      isPublished,
      category,
      tags,
    } = req.body;

    // Kiểm tra xem slug đã tồn tại chưa
    const existing = await News.findOne({ where: { slug } });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: 'Slug đã tồn tại' });
    }

    // Tạo tin tức mới
    const news = await News.create({
      title,
      slug,
      content,
      thumbnail,
      description,
      category: category || 'Tin tức',
      tags,
      isPublished: isPublished === undefined ? true : isPublished,
      userId: req.user.id, // Thông tin người tạo từ req.user
    });

    res.status(201).json({ success: true, news });
  } catch (error) {
    console.error('Lỗi khi tạo tin tức:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Cập nhật tin tức (Admin)
 */
const updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      thumbnail,
      description,
      isPublished,
      category,
      tags,
    } = req.body;

    // Tìm tin tức theo ID
    const news = await News.findByPk(id);

    // Nếu không tìm thấy tin tức, trả về lỗi 404
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy tin tức' });
    }

    // Kiểm tra xem slug được cung cấp có khác với slug hiện tại không
    // Nếu khác, kiểm tra xem slug mới đã tồn tại chưa
    if (slug && slug !== news.slug) {
      const existing = await News.findOne({ where: { slug } });
      if (existing) {
        return res
          .status(400)
          .json({ success: false, message: 'Slug đã tồn tại' });
      }
    }

    // Cập nhật tin tức
    await news.update({
      title,
      slug,
      content,
      thumbnail,
      description,
      category,
      tags,
      isPublished,
    });

    res.json({ success: true, news });
  } catch (error) {
    console.error('Lỗi khi cập nhật tin tức:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

/**
 * Xóa tin tức (Admin)
 */
const deleteNews = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm tin tức theo ID
    const news = await News.findByPk(id);

    // Nếu không tìm thấy tin tức, trả về lỗi 404
    if (!news) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy tin tức' });
    }

    // Xóa tin tức
    await news.destroy();

    res.json({ success: true, message: 'Xóa tin tức thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa tin tức:', error);
    res.status(500).json({ success: false, message: 'Lỗi máy chủ' });
  }
};

module.exports = {
  getAllNews,
  getNewsBySlug,
  getRelatedNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
};
