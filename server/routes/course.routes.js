import express from 'express';
import { Course, Category, Enrollment } from '../models/index.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get Categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// Browse & Discover Courses
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      level,
      sort = 'popular',
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isPublished: true };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        filter.category = catDoc._id;
      }
    }

    if (level) {
      filter.level = level.toUpperCase();
    }

    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'rating') {
      sortOption = { rating: -1 };
    } else if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else {
      // default: popular
      sortOption = { totalRatingsCount: -1, rating: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const totalCount = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate('category', 'name slug icon')
      .populate('instructor', 'name avatar bio')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      data: {
        courses,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// Get Course Details by Slug
router.get('/detail/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const course = await Course.findOne({ slug })
      .populate('category', 'name slug icon')
      .populate('instructor', 'name avatar bio');

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not found.' },
      });
    }

    // Check if current user is enrolled
    let isEnrolled = false;
    let userProgress = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edupulse_super_secret_jwt_key_2026_production_grade');
        const enrollment = await Enrollment.findOne({ user: decoded.id, course: course._id });
        if (enrollment) {
          isEnrolled = true;
          userProgress = enrollment;
        }
      } catch (err) {
        // Token invalid or expired, ignore
      }
    }

    // Calculate total lessons and total duration
    let totalLessonsCount = 0;
    course.sections.forEach((sec) => {
      totalLessonsCount += sec.lessons.length;
    });

    return res.json({
      success: true,
      data: {
        course,
        totalLessonsCount,
        isEnrolled,
        userProgress,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

export default router;
