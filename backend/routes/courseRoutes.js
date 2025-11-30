const express = require('express');
const router = express.Router();
const {
  getAllCourses,
  getCourse,
  createCourse,
  getMyEnrolledCourses,
  getEnrolledCourse,
  getAllCoursesAdmin,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getAllCourses);

// Protected student routes (MUST come before /:id to avoid conflicts)
router.get('/student/my-courses', protect, getMyEnrolledCourses);
router.get('/enrolled/:id', protect, getEnrolledCourse);

// Admin routes (MUST come before /:id to avoid conflicts)
router.get('/admin/all', protect, authorize('admin'), getAllCoursesAdmin);
router.post('/', protect, authorize('admin'), createCourse);
router.put('/:id', protect, authorize('admin'), updateCourse);
router.delete('/:id', protect, authorize('admin'), deleteCourse);

// Public routes with dynamic params (MUST be last)
router.get('/:id', getCourse);

module.exports = router;
