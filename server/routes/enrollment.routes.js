import express from 'express';
import { Enrollment, Course, LessonProgress } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';
import { logAuditAction } from '../middleware/auditLog.js';

const router = express.Router();

// Enroll in a Course
router.post('/enroll', authenticateToken, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user._id;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Course ID is required.' },
      });
    }

    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not available for enrollment.' },
      });
    }

    let enrollment = await Enrollment.findOne({ user: userId, course: courseId });
    if (enrollment) {
      return res.json({
        success: true,
        message: 'Already enrolled in this course.',
        data: enrollment,
      });
    }

    enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      overallProgressPercentage: 0,
    });

    await logAuditAction({
      req,
      user: req.user,
      action: 'COURSE_ENROLLED',
      targetEntity: 'Course',
      targetId: course._id,
      details: `Enrolled in course: ${course.title}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course!',
      data: enrollment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// Get Student's Enrolled Courses
router.get('/my-courses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    const enrollments = await Enrollment.find({ user: userId })
      .populate({
        path: 'course',
        select: 'title slug summary thumbnail level durationSeconds sections rating category instructor',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'instructor', select: 'name avatar' },
        ],
      })
      .sort({ updatedAt: -1 });

    const formattedCourses = enrollments.map((enr) => {
      const courseObj = enr.course ? enr.course.toObject() : null;
      if (!courseObj) return null;

      let totalLessons = 0;
      if (courseObj.sections) {
        courseObj.sections.forEach((sec) => {
          totalLessons += sec.lessons ? sec.lessons.length : 0;
        });
      }

      return {
        enrollmentId: enr._id,
        course: courseObj,
        enrolledAt: enr.enrolledAt,
        completedAt: enr.completedAt,
        progressPercentage: enr.overallProgressPercentage,
        totalLessons,
      };
    }).filter(Boolean);

    return res.json({
      success: true,
      data: formattedCourses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

export default router;
