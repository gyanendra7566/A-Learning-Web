const express = require('express');
const router = express.Router();
const {
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
  gradeSubmission,
  getMySubmissions
} = require('../controllers/submissionController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require authentication

// Student routes
router.post('/', submitAssignment);
router.get('/assignment/:assignmentId', getMySubmission);
router.get('/my-submissions/:courseId', getMySubmissions);

// Admin routes
router.get('/admin/assignment/:assignmentId', authorize('admin'), getAssignmentSubmissions);
router.put('/:id/grade', authorize('admin'), gradeSubmission);

module.exports = router;
