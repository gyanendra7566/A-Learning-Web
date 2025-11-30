const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');

// @desc    Get public platform statistics (no auth required)
// @route   GET /api/public/stats
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const [totalCourses, totalUsers, totalEnrollments] = await Promise.all([
      Course.countDocuments(),
      User.countDocuments(),
      Enrollment.countDocuments({ status: { $in: ['paid', 'active', 'completed'] } })
    ]);

    const completedEnrollments = await Enrollment.countDocuments({ 
      status: 'completed',
      progress: 100 
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalCertificates: completedEnrollments,
        totalRevenue: totalEnrollments * 500 // Estimate or calculate from real payment data
      }
    });
  } catch (error) {
    console.error('Get public stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
