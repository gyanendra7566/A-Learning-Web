const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const User = require('../models/User');

// @desc    Get certificate for completed course (checks if auto-generated)
// @route   POST /api/certificates/generate
// @access  Private
const generateCertificateForStudent = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user.id;

    // Check enrollment and completion
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: 'completed'
    });

    if (!enrollment) {
      return res.status(400).json({
        success: false,
        message: 'Course not completed yet. Please finish all lessons first.'
      });
    }

    // Check if certificate exists (should be auto-generated)
    const certificate = await Certificate.findOne({
      student: studentId,
      course: courseId
    });

    if (certificate) {
      return res.status(200).json({
        success: true,
        message: 'Certificate already generated',
        certificate,
        pdfData: certificate.pdfUrl.split(',')[1] // Extract base64
      });
    }

    // If no certificate exists, something went wrong during auto-generation
    return res.status(404).json({
      success: false,
      message: 'Certificate not found. It should have been auto-generated when you completed the course. Please contact support.'
    });

  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error.message
    });
  }
};

// @desc    Get student's certificates
// @route   GET /api/certificates/my-certificates
// @access  Private
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      student: req.user.id,
      isValid: true
    })
    .populate('course', 'title thumbnail category')
    .sort('-issuedDate');

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificates',
      error: error.message
    });
  }
};

// @desc    Get single certificate
// @route   GET /api/certificates/:id
// @access  Private
const getCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name email')
      .populate('course', 'title instructor')
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name'
        }
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check if user is the owner or admin
    if (certificate.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this certificate'
      });
    }

    res.status(200).json({
      success: true,
      certificate
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching certificate',
      error: error.message
    });
  }
};

// @desc    Verify certificate by ID
// @route   GET /api/certificates/verify/:certificateId
// @access  Public
const verifyCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId
    })
    .populate('student', 'name email')
    .populate('course', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found or invalid'
      });
    }

    if (!certificate.isValid) {
      return res.status(400).json({
        success: false,
        message: 'This certificate has been revoked',
        revokedReason: certificate.revokedReason
      });
    }

    res.status(200).json({
      success: true,
      message: 'Certificate is valid',
      certificate: {
        certificateId: certificate.certificateId,
        studentName: certificate.student.name,
        courseName: certificate.course.title,
        issuedDate: certificate.issuedDate,
        completionDate: certificate.completionDate,
        grade: certificate.grade,
        isValid: certificate.isValid
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying certificate',
      error: error.message
    });
  }
};

// @desc    Download certificate PDF
// @route   GET /api/certificates/:id/download
// @access  Private
const downloadCertificate = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('student', 'name')
      .populate('course', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    // Check authorization
    if (certificate.student._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Extract base64 PDF data
    const pdfData = certificate.pdfUrl.split(',')[1];
    const pdfBuffer = Buffer.from(pdfData, 'base64');

    // Set headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${certificate.certificateId}.pdf`);
    res.send(pdfBuffer);

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error downloading certificate',
      error: error.message
    });
  }
};

module.exports = {
  generateCertificateForStudent,
  getMyCertificates,
  getCertificate,
  verifyCertificate,
  downloadCertificate
};
