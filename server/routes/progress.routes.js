import express from 'express';
import { LessonProgress, Enrollment, Course, Certificate } from '../models/index.js';
import { authenticateToken, checkEnrollment } from '../middleware/auth.js';

const router = express.Router();

// Helper to recalculate course progress percentage
async function recalculateCourseProgress(userId, courseId) {
  const course = await Course.findById(courseId);
  if (!course) return 0;

  let totalLessons = 0;
  const allLessonIds = [];

  course.sections.forEach((sec) => {
    sec.lessons.forEach((les) => {
      totalLessons++;
      allLessonIds.push(les._id.toString());
    });
  });

  if (totalLessons === 0) return 0;

  const completedProgresses = await LessonProgress.find({
    user: userId,
    course: courseId,
    lessonId: { $in: allLessonIds },
    isCompleted: true,
  });

  const completedCount = completedProgresses.length;
  const progressPercentage = Math.round((completedCount / totalLessons) * 100);

  const enrollment = await Enrollment.findOne({ user: userId, course: courseId });
  if (enrollment) {
    enrollment.overallProgressPercentage = progressPercentage;
    if (progressPercentage >= 100 && !enrollment.completedAt) {
      enrollment.completedAt = new Date();

      // Check if certificate already exists, else auto-generate
      const existingCert = await Certificate.findOne({ user: userId, course: courseId });
      if (!existingCert) {
        const certCode = 'EDUPULSE-' + Math.random().toString(36).substring(2, 9).toUpperCase();
        await Certificate.create({
          certificateCode: certCode,
          user: userId,
          course: courseId,
          issuedAt: new Date(),
        });
      }
    }
    await enrollment.save();
  }

  return progressPercentage;
}

// Get user progress for a course
router.get('/course/:courseId', authenticateToken, checkEnrollment, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    const progressRecords = await LessonProgress.find({ user: userId, course: courseId });
    const enrollment = await Enrollment.findOne({ user: userId, course: courseId });

    return res.json({
      success: true,
      data: {
        progressRecords,
        overallProgressPercentage: enrollment ? enrollment.overallProgressPercentage : 0,
        completedAt: enrollment ? enrollment.completedAt : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// Update Video Position (Auto-resuming position saving)
router.post('/video-position', authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId, videoPositionSeconds } = req.body;
    const userId = req.user._id;

    if (!courseId || !lessonId || videoPositionSeconds === undefined) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing courseId, lessonId, or videoPositionSeconds.' },
      });
    }

    let progress = await LessonProgress.findOne({ user: userId, course: courseId, lessonId });
    if (!progress) {
      progress = new LessonProgress({
        user: userId,
        course: courseId,
        lessonId,
        videoPositionSeconds,
      });
    } else {
      progress.videoPositionSeconds = videoPositionSeconds;
    }

    await progress.save();

    return res.json({
      success: true,
      message: 'Video playback position saved.',
      data: { videoPositionSeconds: progress.videoPositionSeconds },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// Mark Lesson Complete / Incomplete
router.post('/mark-complete', authenticateToken, async (req, res) => {
  try {
    const { courseId, lessonId, isCompleted = true } = req.body;
    const userId = req.user._id;

    if (!courseId || !lessonId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Missing courseId or lessonId.' },
      });
    }

    let progress = await LessonProgress.findOne({ user: userId, course: courseId, lessonId });
    if (!progress) {
      progress = new LessonProgress({
        user: userId,
        course: courseId,
        lessonId,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      });
    } else {
      progress.isCompleted = isCompleted;
      progress.completedAt = isCompleted ? new Date() : null;
    }

    await progress.save();

    const overallProgressPercentage = await recalculateCourseProgress(userId, courseId);

    return res.json({
      success: true,
      message: isCompleted ? 'Lesson marked complete.' : 'Lesson marked incomplete.',
      data: {
        lessonId,
        isCompleted: progress.isCompleted,
        overallProgressPercentage,
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
