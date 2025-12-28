import pool from '../config/database.js';
import { validationResult } from 'express-validator';

export const submitAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { assignmentId } = req.params;
    const { fileUrl } = req.body;

    // Check if assignment exists
    const assignmentResult = await pool.query('SELECT * FROM assignments WHERE id = $1', [assignmentId]);
    if (assignmentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const assignment = assignmentResult.rows[0];

    // Check if deadline has passed
    if (new Date(assignment.deadline) < new Date()) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

    // Check if already submitted
    const existingSubmission = await pool.query(
      'SELECT * FROM submissions WHERE assignment_id = $1 AND student_id = $2',
      [assignmentId, req.user.id]
    );

    let result;
    if (existingSubmission.rows.length > 0) {
      // Update existing submission
      result = await pool.query(
        'UPDATE submissions SET file_url = $1, submitted_at = CURRENT_TIMESTAMP WHERE assignment_id = $2 AND student_id = $3 RETURNING *',
        [fileUrl, assignmentId, req.user.id]
      );
    } else {
      // Create new submission
      result = await pool.query(
        'INSERT INTO submissions (assignment_id, student_id, file_url) VALUES ($1, $2, $3) RETURNING *',
        [assignmentId, req.user.id, fileUrl]
      );
    }

    res.status(201).json({
      message: 'Assignment submitted successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMySubmissions = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
             a.title as assignment_title,
             a.description as assignment_description,
             a.deadline as assignment_deadline
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.student_id = $1
      ORDER BY s.submitted_at DESC
    `, [req.user.id]);

    res.json({
      submissions: result.rows
    });
  } catch (error) {
    console.error('Get my submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const result = await pool.query(`
      SELECT s.*, 
             u.name as student_name,
             u.email as student_email,
             a.title as assignment_title
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      WHERE s.assignment_id = $1
      ORDER BY s.submitted_at DESC
    `, [assignmentId]);

    res.json({
      submissions: result.rows
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const gradeSubmission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const result = await pool.query(
      'UPDATE submissions SET grade = $1, feedback = $2 WHERE id = $3 RETURNING *',
      [grade, feedback, submissionId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json({
      message: 'Submission graded successfully',
      submission: result.rows[0]
    });
  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubmissionStats = async (req, res) => {
  try {
    // Get total assignments
    const assignmentsResult = await pool.query('SELECT COUNT(*) as total FROM assignments');
    const totalAssignments = parseInt(assignmentsResult.rows[0].total);

    // Get total students
    const studentsResult = await pool.query("SELECT COUNT(*) as total FROM users WHERE role = 'student'");
    const totalStudents = parseInt(studentsResult.rows[0].total);

    // Get total submissions
    const submissionsResult = await pool.query('SELECT COUNT(*) as total FROM submissions');
    const totalSubmissions = parseInt(submissionsResult.rows[0].total);

    // Get submissions per assignment
    const submissionsPerAssignment = await pool.query(`
      SELECT a.id, a.title, COUNT(s.id) as submission_count
      FROM assignments a
      LEFT JOIN submissions s ON a.id = s.assignment_id
      GROUP BY a.id, a.title
      ORDER BY a.created_at DESC
    `);

    // Get recent submissions
    const recentSubmissions = await pool.query(`
      SELECT s.*, 
             u.name as student_name,
             a.title as assignment_title
      FROM submissions s
      JOIN users u ON s.student_id = u.id
      JOIN assignments a ON s.assignment_id = a.id
      ORDER BY s.submitted_at DESC
      LIMIT 10
    `);

    res.json({
      stats: {
        totalAssignments,
        totalStudents,
        totalSubmissions,
        submissionsPerAssignment: submissionsPerAssignment.rows,
        recentSubmissions: recentSubmissions.rows
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

