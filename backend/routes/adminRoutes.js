const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserDetails,
  toggleBanUser,
  deleteUser,
  updateUserRole,
  getDashboardStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// All routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// @desc    Get all enrollments (Admin) - FOR PAYMENT MANAGEMENT
// @route   GET /api/admin/enrollments
// @access  Private/Admin
router.get('/enrollments', async (req, res) => {
  try {
    console.log('📊 Admin fetching all enrollments...');

    const enrollments = await Enrollment.find({})
      .populate('student', 'name email profilePicture')
      .populate('course', 'title category thumbnail price')
      .sort({ enrolledAt: -1 });

    console.log('✅ Found enrollments:', enrollments.length);

    res.status(200).json({
      success: true,
      count: enrollments.length,
      data: enrollments
    });
  } catch (error) {
    console.error('❌ Get all enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments',
      error: error.message
    });
  }
});

// @desc    Get all courses (Admin)
// @route   GET /api/admin/courses
// @access  Private/Admin
router.get('/courses', async (req, res) => {
  try {
    console.log('📚 Admin fetching all courses...');

    const courses = await Course.find({})
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    console.log('✅ Found courses:', courses.length);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses
    });
  } catch (error) {
    console.error('❌ Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
});

// @desc    Update enrollment status (Admin)
// @route   PUT /api/admin/enrollments/:id
// @access  Private/Admin
router.put('/enrollments/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate('student', 'name email')
      .populate('course', 'title');

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('✅ Updated enrollment:', enrollment._id);

    res.status(200).json({
      success: true,
      data: enrollment
    });
  } catch (error) {
    console.error('❌ Update enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update enrollment',
      error: error.message
    });
  }
});

// @desc    Delete enrollment (Admin)
// @route   DELETE /api/admin/enrollments/:id
// @access  Private/Admin
router.delete('/enrollments/:id', async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    console.log('✅ Deleted enrollment:', enrollment._id);

    res.status(200).json({
      success: true,
      message: 'Enrollment deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete enrollment',
      error: error.message
    });
  }
});

module.exports = router;
