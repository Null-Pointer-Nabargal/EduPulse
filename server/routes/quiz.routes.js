import express from 'express';
import { Course, QuizAttempt } from '../models/index.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Fetch Quiz Questions
router.get('/:courseId/:quizId', authenticateToken, async (req, res) => {
  try {
    const { courseId, quizId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not found.' },
      });
    }

    let targetQuiz = null;
    for (const sec of course.sections) {
      const q = sec.quizzes.id(quizId);
      if (q) {
        targetQuiz = q;
        break;
      }
    }

    if (!targetQuiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found.' },
      });
    }

    // Hide correct answers during quiz attempt
    const sanitizeQuestions = targetQuiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      explanation: q.explanation,
      options: q.options.map((opt) => ({ text: opt.text })),
    }));

    // Check user attempts
    const attempts = await QuizAttempt.find({
      user: req.user._id,
      course: courseId,
      quizId,
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: {
        quiz: {
          _id: targetQuiz._id,
          title: targetQuiz.title,
          passingScore: targetQuiz.passingScore,
          attemptLimit: targetQuiz.attemptLimit,
          timeLimitMinutes: targetQuiz.timeLimitMinutes,
          questions: sanitizeQuestions,
        },
        attemptsCount: attempts.length,
        userAttempts: attempts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    });
  }
});

// Submit Quiz Attempt
router.post('/:courseId/:quizId/submit', authenticateToken, async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedOptionIndex }
    const userId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Course not found.' },
      });
    }

    let targetQuiz = null;
    for (const sec of course.sections) {
      const q = sec.quizzes.id(quizId);
      if (q) {
        targetQuiz = q;
        break;
      }
    }

    if (!targetQuiz) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Quiz not found.' },
      });
    }

    // Check attempt limit
    const existingAttemptsCount = await QuizAttempt.countDocuments({
      user: userId,
      course: courseId,
      quizId,
    });

    if (targetQuiz.attemptLimit > 0 && existingAttemptsCount >= targetQuiz.attemptLimit) {
      return res.status(403).json({
        success: false,
        error: { code: 'ATTEMPT_LIMIT_EXCEEDED', message: 'Maximum quiz attempt limit reached.' },
      });
    }

    let correctCount = 0;
    const evaluatedAnswers = [];
    const totalQuestions = targetQuiz.questions.length;

    targetQuiz.questions.forEach((q) => {
      const userAns = answers ? answers.find((a) => a.questionId === q._id.toString()) : null;
      const selectedIdx = userAns ? userAns.selectedOptionIndex : null;

      let isCorrect = false;
      let correctOptionIndex = -1;

      q.options.forEach((opt, idx) => {
        if (opt.isCorrect) correctOptionIndex = idx;
      });

      if (selectedIdx !== null && selectedIdx === correctOptionIndex) {
        isCorrect = true;
        correctCount++;
      }

      evaluatedAnswers.push({
        questionId: q._id.toString(),
        questionText: q.questionText,
        selectedOptionIndex: selectedIdx,
        correctOptionIndex,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const scorePercentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = scorePercentage >= targetQuiz.passingScore;

    const quizAttempt = await QuizAttempt.create({
      user: userId,
      course: courseId,
      quizId,
      score: scorePercentage,
      passed,
      answers: evaluatedAnswers.map((ea) => ({
        questionId: ea.questionId,
        selectedOptionIndex: ea.selectedOptionIndex,
        isCorrect: ea.isCorrect,
      })),
    });

    return res.json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep learning and try again.',
      data: {
        attemptId: quizAttempt._id,
        score: scorePercentage,
        passingScore: targetQuiz.passingScore,
        passed,
        correctCount,
        totalQuestions,
        evaluatedAnswers,
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
