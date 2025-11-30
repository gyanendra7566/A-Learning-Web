const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment
} = require('../controllers/assignmentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

// Student & Admin routes
router.get('/course/:courseId', getCourseAssignments);
router.get('/:id', getAssignment);

// Admin only routes
router.post('/', authorize('admin'), createAssignment);
router.put('/:id', authorize('admin'), updateAssignment);
router.delete('/:id', authorize('admin'), deleteAssignment);

module.exports = router;
