const Progress = require('../models/Progress');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

// @desc    Update video progress
// @route   POST /api/progress/update
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { courseId, lessonId, videoProgress, totalDuration } = req.body;
    const studentId = req.user.id;

    // Find enrollment
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ['paid', 'active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Calculate if video is completed (watched more than 90%)
    const isCompleted = videoProgress >= totalDuration * 0.9;

    // Update or create progress
    let progress = await Progress.findOneAndUpdate(
      { student: studentId, course: courseId, lessonId },
      {
        videoProgress,
        totalDuration,
        isCompleted,
        lastWatched: Date.now(),
        enrollment: enrollment._id
      },
      { new: true, upsert: true }
    );

    // Update enrollment's last accessed lesson
    enrollment.lastAccessedLesson = lessonId;
    enrollment.lastAccessedAt = Date.now();

    // If lesson completed, add to completed lessons if not already there
    if (isCompleted && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    await enrollment.save();

    // Calculate overall course progress
    await updateCourseProgress(enrollment._id, courseId);

    res.status(200).json({
      success: true,
      message: 'Progress updated',
      progress
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating progress',
      error: error.message
    });
  }
};

// @desc    Get progress for a specific lesson
// @route   GET /api/progress/:courseId/:lessonId
// @access  Private
exports.getLessonProgress = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user.id;

    const progress = await Progress.findOne({
      student: studentId,
      course: courseId,
      lessonId
    });

    res.status(200).json({
      success: true,
      progress: progress || { videoProgress: 0, isCompleted: false }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching progress',
      error: error.message
    });
  }
};

// @desc    Get all progress for a course
// @route   GET /api/progress/course/:courseId
// @access  Private
exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user.id;

    const progressRecords = await Progress.find({
      student: studentId,
      course: courseId
    });

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    res.status(200).json({
      success: true,
      progressRecords,
      enrollment: {
        progress: enrollment?.progress || 0,
        completedLessons: enrollment?.completedLessons || [],
        lastAccessedLesson: enrollment?.lastAccessedLesson
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course progress',
      error: error.message
    });
  }
};

// @desc    Mark lesson as completed
// @route   POST /api/progress/complete
// @access  Private
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.body;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Not enrolled in this course'
      });
    }

    // Update progress
    await Progress.findOneAndUpdate(
      { student: studentId, course: courseId, lessonId },
      {
        isCompleted: true,
        lastWatched: Date.now()
      },
      { upsert: true }
    );

    // Add to completed lessons
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      await enrollment.save();
    }

    // Update overall progress
    await updateCourseProgress(enrollment._id, courseId);

    res.status(200).json({
      success: true,
      message: 'Lesson marked as completed'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error marking lesson complete',
      error: error.message
    });
  }
};

// Helper function to calculate overall course progress WITH AUTO-CERTIFICATE GENERATION
async function updateCourseProgress(enrollmentId, courseId) {
  const enrollment = await Enrollment.findById(enrollmentId);
  const course = await Course.findById(courseId);

  if (!course || !enrollment) return;

  const totalLessons = course.lessons.length;
  const completedLessons = enrollment.completedLessons.length;

  if (totalLessons > 0) {
    enrollment.progress = Math.round((completedLessons / totalLessons) * 100);
    
    // Mark as completed if all lessons done
    if (completedLessons === totalLessons && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = Date.now();
      
      // AUTO-GENERATE CERTIFICATE
      try {
        const Certificate = require('../models/Certificate');
        const User = require('../models/User');
        const generateCertificate = require('../utils/generateCertificate');
        const crypto = require('crypto');

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({
          student: enrollment.student,
          course: courseId
        });
        
        if (!existingCert) {
          console.log(`🎓 Auto-generating certificate for student ${enrollment.student}...`);
          
          // Get student and course details
          const student = await User.findById(enrollment.student);
          
          if (student && course) {
            // Generate unique certificate ID
            const certificateId = `CERT-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
            
            // Verification URL
            const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-certificate/${certificateId}`;
            
            // Calculate grade based on progress
            const grade = enrollment.progress >= 95 ? 'A+' :
                         enrollment.progress >= 90 ? 'A' :
                         enrollment.progress >= 85 ? 'B+' :
                         enrollment.progress >= 80 ? 'B' :
                         enrollment.progress >= 75 ? 'C' : 'Pass';
            
            // Generate PDF
            const pdfBuffer = await generateCertificate({
              studentName: student.name,
              courseName: course.title,
              completionDate: enrollment.completedAt || Date.now(),
              certificateId,
              grade,
              verificationUrl
            });
            
            // Store certificate
            const pdfBase64 = pdfBuffer.toString('base64');
            
            await Certificate.create({
              student: enrollment.student,
              course: courseId,
              enrollment: enrollment._id,
              certificateId,
              completionDate: enrollment.completedAt || Date.now(),
              grade,
              verificationUrl,
              pdfUrl: `data:application/pdf;base64,${pdfBase64}`
            });
            
            console.log(`✅ Certificate auto-generated: ${certificateId}`);
          }
        } else {
          console.log(`ℹ️ Certificate already exists for this course`);
        }
      } catch (certError) {
        console.error('❌ Auto-generate certificate error:', certError.message);
        // Don't fail the whole request if certificate generation fails
      }
    }
    
    await enrollment.save();
  }
}
