import express from 'express';
import {
  submitAssignment,
  getMySubmissions,
  getSubmissionsByAssignment,
  gradeSubmission,
  getSubmissionStats
} from '../controllers/submissionController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

const submitValidation = [
  body('fileUrl').trim().notEmpty().withMessage('File URL is required')
];

const gradeValidation = [
  body('grade').optional().isInt({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100'),
  body('feedback').optional().trim()
];

router.post('/submit/:assignmentId', authenticate, authorize('student'), submitValidation, submitAssignment);
router.get('/my-submissions', authenticate, authorize('student'), getMySubmissions);
router.get('/submissions/:assignmentId', authenticate, authorize('admin'), getSubmissionsByAssignment);
router.patch('/grade/:submissionId', authenticate, authorize('admin'), gradeValidation, gradeSubmission);
router.get('/stats/overview', authenticate, authorize('admin'), getSubmissionStats);

export default router;

