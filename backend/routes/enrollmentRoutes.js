const express = require('express');
const router = express.Router();
const {
  initiateEnrollment,
  confirmPayment,
  getEnrollmentStatus
} = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');

router.use(protect); // All routes require authentication

// ADD THIS NEW ROUTE ⬇️
// @desc    Get my enrollments
// @route   GET /api/enrollments/my-enrollments
// @access  Private
router.get('/my-enrollments', async (req, res) => {
  try {
    console.log('📚 Fetching enrollments for user:', req.user._id);

    const enrollments = await Enrollment.find({ 
      student: req.user._id,
      status: { $in: ['paid', 'active', 'completed'] }
    })
    .populate('course', 'title description category price thumbnail duration instructor')
    .sort({ enrolledAt: -1 });

    console.log('✅ Found enrollments:', enrollments.length);

    res.status(200).json({
      success: true,
      data: enrollments
    });
  } catch (error) {
    console.error('Get my enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch enrollments'
    });
  }
});

// Existing routes
router.post('/initiate', initiateEnrollment);
router.post('/confirm', confirmPayment);
router.get('/status/:courseId', getEnrollmentStatus);

module.exports = router;
