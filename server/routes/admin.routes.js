import express from 'express';
import bcrypt from 'bcryptjs';
import { User, Course, Category, Enrollment, Certificate, AuditLog, PlatformSettings } from '../models/index.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/auditLog.js';

const router = express.Router();

// Strict Server-Side Authorization Guard for all Admin endpoints
router.use(authenticateToken);
router.use(requireRole('ADMIN'));

// 1. Analytics Dashboard Overview
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const studentCount = await User.countDocuments({ role: 'STUDENT' });
    const instructorCount = await User.countDocuments({ role: 'INSTRUCTOR' });

    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const totalEnrollments = await Enrollment.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    // Calculate completion rate
    const completedEnrollments = await Enrollment.countDocuments({ overallProgressPercentage: 100 });
    const completionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

    // Recent Enrollments Feed
    const recentEnrollments = await Enrollment.find()
      .populate('user', 'name email avatar')
      .populate('course', 'title thumbnail')
      .sort({ createdAt: -1 })
      .limit(5);

    // Recent Users
    const recentUsers = await User.find().select('-passwordHash').sort({ createdAt: -1 }).limit(5);

    // Top Categories
    const categories = await Category.find();
    const categoryStats = await Promise.all(
      categories.map(async (cat) => {
        const count = await Course.countDocuments({ category: cat._id });
        return { name: cat.name, count };
      })
    );

    return res.json({
      success: true,
      data: {
        kpis: {
          totalUsers,
          activeUsers,
          studentCount,
          instructorCount,
          totalCourses,
          publishedCourses,
          totalEnrollments,
          completedEnrollments,
          completionRate,
          totalCertificates,
        },
        recentEnrollments,
        recentUsers,
        categoryStats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// 2. User Management (List, Create, Update, Delete, Toggle Status)
router.get('/users', async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    if (role) {
      filter.role = role.toUpperCase();
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      success: true,
      data: { users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { name, email, password, role = 'STUDENT' } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Name, email, and password are required.' },
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'Email is already registered.' },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      isActive: true,
      emailVerified: true,
    });

    await logAuditAction({
      req,
      user: req.user,
      action: 'ADMIN_CREATE_USER',
      targetEntity: 'User',
      targetId: user._id,
      details: `Admin created user ${user.email} with role ${user.role}`,
    });

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    await logAuditAction({
      req,
      user: req.user,
      action: 'ADMIN_UPDATE_USER',
      targetEntity: 'User',
      targetId: user._id,
      details: `Admin updated user ${user.email}`,
    });

    return res.json({
      success: true,
      message: 'User updated successfully.',
      data: { id: user._id, name: user.name, email: user.email, role: user.role, isActive: user.isActive },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: { code: 'BAD_REQUEST', message: 'You cannot delete your own admin account.' },
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found.' },
      });
    }

    await logAuditAction({
      req,
      user: req.user,
      action: 'ADMIN_DELETE_USER',
      targetEntity: 'User',
      targetId: id,
      details: `Admin deleted user ${user.email}`,
    });

    return res.json({
      success: true,
      message: 'User deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// 3. Course Management & Interactive Builder
router.get('/courses', async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('category', 'name slug')
      .populate('instructor', 'name email avatar')
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const {
      title,
      summary,
      description,
      thumbnail,
      category,
      instructor,
      level = 'BEGINNER',
      price = 0,
      isPublished = false,
      sections = [],
    } = req.body;

    if (!title || !summary || !description || !thumbnail || !category) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing required course fields.' },
      });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString(36);
    const instructorId = instructor || req.user._id;

    const course = await Course.create({
      title: title.trim(),
      slug,
      summary: summary.trim(),
      description: description.trim(),
      thumbnail,
      category,
      instructor: instructorId,
      level,
      price,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      sections,
    });

    await logAuditAction({
      req,
      user: req.user,
      action: 'ADMIN_CREATE_COURSE',
      targetEntity: 'Course',
      targetId: course._id,
      details: `Created course: ${course.title}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Course created successfully.',
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      summary,
      description,
      thumbnail,
      category,
      instructor,
      level,
      price,
      isPublished,
      sections,
    } = req.body;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not found.' },
      });
    }

    if (title) course.title = title.trim();
    if (summary) course.summary = summary.trim();
    if (description) course.description = description.trim();
    if (thumbnail) course.thumbnail = thumbnail;
    if (category) course.category = category;
    if (instructor) course.instructor = instructor;
    if (level) course.level = level;
    if (price !== undefined) course.price = price;
    if (sections) course.sections = sections;

    if (isPublished !== undefined && isPublished !== course.isPublished) {
      course.isPublished = isPublished;
      if (isPublished && !course.publishedAt) {
        course.publishedAt = new Date();
      }
    }

    await course.save();

    await logAuditAction({
      req,
      user: req.user,
      action: 'ADMIN_UPDATE_COURSE',
      targetEntity: 'Course',
      targetId: course._id,
      details: `Updated course: ${course.title}`,
    });

    return res.json({
      success: true,
      message: 'Course updated successfully.',
      data: course,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not found.' },
      });
    }

    await logAuditAction({
      req,
      user: req.user,
      action: 'ADMIN_DELETE_COURSE',
      targetEntity: 'Course',
      targetId: id,
      details: `Deleted course: ${course.title}`,
    });

    return res.json({
      success: true,
      message: 'Course deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// 4. Categories Management
router.post('/categories', async (req, res) => {
  try {
    const { name, description, icon = 'BookOpen' } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Category name is required.' },
      });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const category = await Category.create({ name: name.trim(), slug, description, icon });

    return res.status(201).json({
      success: true,
      message: 'Category created.',
      data: category,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// 5. Audit Logs Viewer
router.get('/audit-logs', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(parseInt(limit));
    return res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// 6. Platform Settings Management
router.get('/settings', async (req, res) => {
  try {
    const settings = await PlatformSettings.find();
    return res.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { settings } = req.body; // array of { key, value, description }
    if (Array.isArray(settings)) {
      for (const item of settings) {
        await PlatformSettings.findOneAndUpdate(
          { key: item.key },
          { value: item.value, description: item.description || '' },
          { upsert: true }
        );
      }
    }
    await logAuditAction({
      req,
      user: req.user,
      action: 'ADMIN_UPDATE_SETTINGS',
      targetEntity: 'PlatformSettings',
      details: 'Updated platform settings',
    });
    return res.json({
      success: true,
      message: 'Settings updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

export default router;
