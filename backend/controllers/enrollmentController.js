const Enrollment = require('../models/Enrollment');
const Transaction = require('../models/Transaction');
const Course = require('../models/Course');
const crypto = require('crypto');

// @desc    Initiate enrollment (create pending enrollment & transaction)
// @route   POST /api/enrollments/initiate
// @access  Private
exports.initiateEnrollment = async (req, res) => {
  try {
    const { courseId, studentDetails } = req.body;
    const studentId = req.user.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ['paid', 'active', 'completed'] }
    });
    
    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course'
      });
    }
    
    // Generate unique transaction ID
    const transactionId = `TXN${Date.now()}${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    
    // Create pending enrollment
    let enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: 'pending'
    });
    
    if (!enrollment) {
      enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        status: 'pending',
        paymentStatus: 'pending'
      });
    }
    
    // Create transaction
    const transaction = await Transaction.create({
      student: studentId,
      course: courseId,
      enrollment: enrollment._id,
      amount: course.price,
      transactionId,
      upiId: 'elearning@upi',
      status: 'pending',
      studentDetails: studentDetails || {
        name: req.user.name,
        email: req.user.email
      },
      qrCodeData: `upi://pay?pa=elearning@upi&pn=ELearning&am=${course.price}&tn=Course-${course.title}&cu=INR`
    });
    
    res.status(200).json({
      success: true,
      message: 'Enrollment initiated. Please complete payment.',
      data: {
        transactionId: transaction.transactionId,
        enrollmentId: enrollment._id,
        amount: course.price,
        courseName: course.title,
        upiId: transaction.upiId,
        qrCodeData: transaction.qrCodeData
      }
    });
    
  } catch (error) {
    console.error('Initiate enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initiating enrollment',
      error: error.message
    });
  }
};

// @desc    Confirm payment (manual verification for now)
// @route   POST /api/enrollments/confirm
// @access  Private
exports.confirmPayment = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    // Find transaction
    const transaction = await Transaction.findOne({ transactionId });
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    // Update transaction status
    transaction.status = 'completed';
    transaction.completedAt = Date.now();
    await transaction.save();
    
    // Update enrollment status
    const enrollment = await Enrollment.findById(transaction.enrollment);
    enrollment.status = 'active';
    enrollment.paymentStatus = 'completed';
    await enrollment.save();
    
    // Update course enrolled students count
    await Course.findByIdAndUpdate(transaction.course, {
      $inc: { enrolledStudents: 1 }
    });
    
    res.status(200).json({
      success: true,
      message: 'Payment confirmed! You are now enrolled in the course.',
      enrollmentId: enrollment._id
    });
    
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming payment',
      error: error.message
    });
  }
};

// @desc    Get enrollment status
// @route   GET /api/enrollments/status/:courseId
// @access  Private
exports.getEnrollmentStatus = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId
    });
    
    res.status(200).json({
      success: true,
      isEnrolled: enrollment && ['paid', 'active', 'completed'].includes(enrollment.status),
      enrollment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking enrollment status',
      error: error.message
    });
  }
};
