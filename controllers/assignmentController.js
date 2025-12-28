import pool from '../config/database.js';
import { validationResult } from 'express-validator';

export const createAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, deadline } = req.body;

    const result = await pool.query(
      'INSERT INTO assignments (title, description, deadline, created_by) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, deadline, req.user.id]
    );

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAssignments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT a.*, 
             u.name as created_by_name,
             COUNT(s.id) as submission_count
      FROM assignments a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      GROUP BY a.id, u.name
      ORDER BY a.created_at DESC
    `);

    res.json({
      assignments: result.rows
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT a.*, 
             u.name as created_by_name,
             COUNT(s.id) as submission_count
      FROM assignments a
      LEFT JOIN users u ON a.created_by = u.id
      LEFT JOIN submissions s ON a.id = s.assignment_id
      WHERE a.id = $1
      GROUP BY a.id, u.name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAssignment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, description, deadline } = req.body;

    const result = await pool.query(
      'UPDATE assignments SET title = $1, description = $2, deadline = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, description, deadline, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      message: 'Assignment updated successfully',
      assignment: result.rows[0]
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM assignments WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

