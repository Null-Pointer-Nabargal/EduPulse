import express from 'express';
import { Certificate } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get Student's Earned Certificates
router.get('/my-certificates', authenticateToken, async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate({
        path: 'course',
        select: 'title slug thumbnail category instructor',
        populate: [
          { path: 'category', select: 'name' },
          { path: 'instructor', select: 'name' },
        ],
      })
      .sort({ issuedAt: -1 });

    return res.json({
      success: true,
      data: certificates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// Public Verification Endpoint
router.get('/verify/:certificateCode', async (req, res) => {
  try {
    const { certificateCode } = req.params;

    const cert = await Certificate.findOne({ certificateCode: certificateCode.toUpperCase().trim() })
      .populate('user', 'name')
      .populate({
        path: 'course',
        select: 'title summary level instructor',
        populate: { path: 'instructor', select: 'name' },
      });

    if (!cert) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVALID_CERTIFICATE', message: 'No authentic certificate found with this identification code.' },
      });
    }

    return res.json({
      success: true,
      data: {
        isValid: true,
        certificateCode: cert.certificateCode,
        studentName: cert.user ? cert.user.name : 'Learner',
        courseTitle: cert.course ? cert.course.title : 'Online Course',
        courseLevel: cert.course ? cert.course.level : 'All Levels',
        instructorName: cert.course && cert.course.instructor ? cert.course.instructor.name : 'EduPulse Faculty',
        issuedAt: cert.issuedAt,
        issuer: 'EduPulse International EdTech Academy',
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
