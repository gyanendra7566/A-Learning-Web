const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Create assignment (Admin only)
// @route   POST /api/assignments
// @access  Private/Admin
const createAssignment = async (req, res) => {
  try {
    const { courseId, title, description, instructions, maxScore, dueDate, attachments } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const assignment = await Assignment.create({
      course: courseId,
      title,
      description,
      instructions,
      maxScore: maxScore || 100,
      dueDate,
      attachments: attachments || [],
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });

  } catch (error) {
    console.error('Create assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating assignment',
      error: error.message
    });
  }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is enrolled (for students)
    if (req.user.role === 'student') {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId,
        status: { $in: ['paid', 'active', 'completed'] }
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: 'You must be enrolled to view assignments'
        });
      }
    }

    const assignments = await Assignment.find({
      course: courseId,
      isActive: true
    })
    .populate('createdBy', 'name')
    .sort('-createdAt');

    // Get submission status for each assignment (if student)
    if (req.user.role === 'student') {
      const submissions = await Submission.find({
        student: req.user.id,
        course: courseId
      });

      const assignmentsWithStatus = assignments.map(assignment => {
        const submission = submissions.find(
          s => s.assignment.toString() === assignment._id.toString()
        );
        return {
          ...assignment.toObject(),
          submission: submission || null,
          hasSubmitted: !!submission,
          submissionStatus: submission ? submission.status : 'not_submitted'
        };
      });

      return res.status(200).json({
        success: true,
        count: assignmentsWithStatus.length,
        assignments: assignmentsWithStatus
      });
    }

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching assignments',
      error: error.message
    });
  }
};

// @desc    Get single assignment
// @route   GET /api/assignments/:id
// @access  Private
const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title')
      .populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // If student, get their submission
    if (req.user.role === 'student') {
      const submission = await Submission.findOne({
        assignment: assignment._id,
        student: req.user.id
      });

      return res.status(200).json({
        success: true,
        assignment,
        submission: submission || null
      });
    }

    res.status(200).json({
      success: true,
      assignment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching assignment',
      error: error.message
    });
  }
};

// @desc    Update assignment
// @route   PUT /api/assignments/:id
// @access  Private/Admin
const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully',
      assignment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating assignment',
      error: error.message
    });
  }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private/Admin
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Delete all related submissions
    await Submission.deleteMany({ assignment: assignment._id });

    res.status(200).json({
      success: true,
      message: 'Assignment and related submissions deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting assignment',
      error: error.message
    });
  }
};

module.exports = {
  createAssignment,
  getCourseAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment
};
