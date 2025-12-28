import express from 'express';
import {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
} from '../controllers/assignmentController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

const assignmentValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('deadline').isISO8601().withMessage('Valid deadline date is required')
];

router.post('/', authenticate, authorize('admin'), assignmentValidation, createAssignment);
router.get('/', authenticate, authorize('admin', 'student'), getAssignments);
router.get('/:id', authenticate, authorize('admin', 'student'), getAssignmentById);
router.put('/:id', authenticate, authorize('admin'), assignmentValidation, updateAssignment);
router.delete('/:id', authenticate, authorize('admin'), deleteAssignment);

export default router;

