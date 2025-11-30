const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private/Admin
const getAllTransactions = async (req, res) => {
  try {
    const { status, startDate, endDate, search } = req.query;

    // Build query
    let query = { status: { $in: ['paid', 'active', 'completed'] } };

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.enrolledAt = {};
      if (startDate) query.enrolledAt.$gte = new Date(startDate);
      if (endDate) query.enrolledAt.$lte = new Date(endDate);
    }

    const transactions = await Enrollment.find(query)
      .populate('student', 'name email')
      .populate('course', 'title price thumbnail')
      .sort('-enrolledAt');

    // Search filter
    let filteredTransactions = transactions;
    if (search) {
      filteredTransactions = transactions.filter(t =>
        t.student.name.toLowerCase().includes(search.toLowerCase()) ||
        t.student.email.toLowerCase().includes(search.toLowerCase()) ||
        t.course.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate total revenue
    const totalRevenue = filteredTransactions.reduce((sum, t) => sum + (t.course.price || 0), 0);

    res.status(200).json({
      success: true,
      count: filteredTransactions.length,
      totalRevenue,
      transactions: filteredTransactions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private/Admin
const getTransactionStats = async (req, res) => {
  try {
    // Total revenue
    const enrollments = await Enrollment.find({
      status: { $in: ['paid', 'active', 'completed'] }
    }).populate('course', 'price');

    const totalRevenue = enrollments.reduce((sum, e) => sum + (e.course.price || 0), 0);
    const totalTransactions = enrollments.length;

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const revenueByMonth = await Enrollment.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'active', 'completed'] },
          enrolledAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      { $unwind: '$courseData' },
      {
        $group: {
          _id: {
            year: { $year: '$enrolledAt' },
            month: { $month: '$enrolledAt' }
          },
          revenue: { $sum: '$courseData.price' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Top selling courses
    const topCourses = await Enrollment.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'active', 'completed'] }
        }
      },
      {
        $group: {
          _id: '$course',
          enrollments: { $sum: 1 }
        }
      },
      { $sort: { enrollments: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'courseData'
        }
      },
      { $unwind: '$courseData' }
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalTransactions,
        averageOrderValue: totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0,
        revenueByMonth,
        topCourses
      }
    });

  } catch (error) {
    console.error('Transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction statistics',
      error: error.message
    });
  }
};

// @desc    Get single transaction details
// @route   GET /api/transactions/:id
// @access  Private/Admin
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Enrollment.findById(req.params.id)
      .populate('student', 'name email profilePicture')
      .populate('course', 'title price thumbnail category');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.status(200).json({
      success: true,
      transaction
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
};

module.exports = {
  getAllTransactions,
  getTransactionStats,
  getTransactionById
};
