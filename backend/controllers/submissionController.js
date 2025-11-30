const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Enrollment = require('../models/Enrollment');

// @desc    Submit assignment
// @route   POST /api/submissions
// @access  Private/Student
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, content, fileUrl, fileName, fileSize } = req.body;
    const studentId = req.user.id;

    // Get assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: assignment.course,
      status: { $in: ['paid', 'active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to submit assignments'
      });
    }

    // Check if late
    const now = new Date();
    const isLate = now > new Date(assignment.dueDate);

    // Check if already submitted
    let submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    });

    if (submission) {
      // Update existing submission
      submission.content = content;
      submission.fileUrl = fileUrl || submission.fileUrl;
      submission.fileName = fileName || submission.fileName;
      submission.fileSize = fileSize || submission.fileSize;
      submission.submittedAt = Date.now();
      submission.isLate = isLate;
      submission.status = 'pending'; // Reset to pending when resubmitted
      await submission.save();

      return res.status(200).json({
        success: true,
        message: isLate ? 'Assignment resubmitted (Late)' : 'Assignment resubmitted successfully',
        submission
      });
    }

    // Create new submission
    submission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      course: assignment.course,
      content,
      fileUrl,
      fileName,
      fileSize,
      isLate,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: isLate ? 'Assignment submitted (Late)' : 'Assignment submitted successfully',
      submission
    });

  } catch (error) {
    console.error('Submit assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting assignment',
      error: error.message
    });
  }
};

// @desc    Get student's submission for an assignment
// @route   GET /api/submissions/assignment/:assignmentId
// @access  Private
const getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user.id
    })
    .populate('assignment', 'title maxScore dueDate')
    .populate('gradedBy', 'name');

    res.status(200).json({
      success: true,
      submission: submission || null
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message
    });
  }
};

// @desc    Get all submissions for an assignment (Admin)
// @route   GET /api/submissions/admin/assignment/:assignmentId
// @access  Private/Admin
const getAssignmentSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      assignment: req.params.assignmentId
    })
    .populate('student', 'name email profilePicture')
    .populate('assignment', 'title maxScore')
    .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

// @desc    Grade submission
// @route   PUT /api/submissions/:id/grade
// @access  Private/Admin
const gradeSubmission = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const submissionId = req.params.id;

    const submission = await Submission.findById(submissionId)
      .populate('assignment', 'maxScore');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    // Validate score
    if (score > submission.assignment.maxScore) {
      return res.status(400).json({
        success: false,
        message: `Score cannot exceed maximum score of ${submission.assignment.maxScore}`
      });
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedBy = req.user.id;
    submission.gradedAt = Date.now();
    await submission.save();

    res.status(200).json({
      success: true,
      message: 'Submission graded successfully',
      submission
    });

  } catch (error) {
    console.error('Grade submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error grading submission',
      error: error.message
    });
  }
};

// @desc    Get all my submissions (Student)
// @route   GET /api/submissions/my-submissions/:courseId
// @access  Private/Student
const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      student: req.user.id,
      course: req.params.courseId
    })
    .populate('assignment', 'title maxScore dueDate')
    .sort('-submittedAt');

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
};

module.exports = {
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
  gradeSubmission,
  getMySubmissions
};
