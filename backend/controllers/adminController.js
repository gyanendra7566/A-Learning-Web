const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Certificate = require('../models/Certificate');

// @desc    Get all users with stats
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const { role, search, status, page = 1, limit = 10 } = req.query;

    // Build query
    let query = {};

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by banned status
    if (status === 'banned') {
      query.isBanned = true;
    } else if (status === 'active') {
      query.isBanned = false;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        if (user.role === 'student') {
          const enrollmentCount = await Enrollment.countDocuments({
            student: user._id
          });
          const certificateCount = await Certificate.countDocuments({
            student: user._id
          });
          
          return {
            ...user.toObject(),
            enrollmentCount,
            certificateCount
          };
        }
        return user.toObject();
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get single user details
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get enrollments if student
    let enrollments = [];
    let certificates = [];
    if (user.role === 'student') {
      enrollments = await Enrollment.find({ student: user._id })
        .populate('course', 'title thumbnail')
        .sort('-enrolledAt');
      
      certificates = await Certificate.find({ student: user._id })
        .populate('course', 'title')
        .sort('-issuedDate');
    }

    res.status(200).json({
      success: true,
      user,
      enrollments,
      certificates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details',
      error: error.message
    });
  }
};

// @desc    Ban/Unban user
// @route   PUT /api/admin/users/:id/ban
// @access  Private/Admin
const toggleBanUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent banning admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users'
      });
    }

    // Toggle ban status
    user.isBanned = !user.isBanned;
    
    if (user.isBanned) {
      user.bannedReason = reason || 'Violated terms of service';
      user.bannedAt = Date.now();
    } else {
      user.bannedReason = undefined;
      user.bannedAt = undefined;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBanned: user.isBanned
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user ban status',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting admins
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    // Delete related data
    await Enrollment.deleteMany({ student: user._id });
    await Certificate.deleteMany({ student: user._id });
    
    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User and related data deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be student or admin'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // User stats
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const bannedUsers = await User.countDocuments({ isBanned: true });

    // Course stats
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();
    const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

    // Certificate stats
    const totalCertificates = await Certificate.countDocuments();

    // Recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort('-createdAt')
      .limit(5);

    // Revenue calculation
    const totalRevenue = await Enrollment.aggregate([
      { $match: { status: { $in: ['paid', 'active', 'completed'] } } },
      { $lookup: { from: 'courses', localField: 'course', foreignField: '_id', as: 'courseData' } },
      { $unwind: '$courseData' },
      { $group: { _id: null, total: { $sum: '$courseData.price' } } }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          students: totalStudents,
          admins: totalAdmins,
          banned: bannedUsers
        },
        courses: {
          total: totalCourses,
          enrollments: totalEnrollments,
          completed: completedEnrollments
        },
        certificates: totalCertificates,
        revenue: totalRevenue[0]?.total || 0
      },
      recentUsers
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  toggleBanUser,
  deleteUser,
  updateUserRole,
  getDashboardStats
};
