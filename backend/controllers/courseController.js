const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Progress = require('../models/Progress');
const Certificate = require('../models/Certificate');
const Assignment = require('../models/Assignment');

// @desc    Get all courses (public)
// @route   GET /api/courses
// @access  Public
const getAllCourses = async (req, res) => {
  try {
    const { category, level, search, sort } = req.query;
    let query = { isApproved: true };
    
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) query.$text = { $search: search };
    
    let sortOption = {};
    if (sort === 'price-low') sortOption = { price: 1 };
    else if (sort === 'price-high') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else sortOption = { createdAt: -1 };
    
    const courses = await Course.find(query)
      .populate('instructor', 'name profilePicture')
      .sort(sortOption);
    
    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name email profilePicture');
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }
    
    res.status(200).json({
      success: true,
      course
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    req.body.instructor = req.user.id;
    const course = await Course.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message
    });
  }
};

// @desc    Get my enrolled courses
// @route   GET /api/courses/student/my-courses
// @access  Private
const getMyEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ 
      student: req.user.id,
      status: { $in: ['paid', 'active', 'completed'] }
    })
    .populate({
      path: 'course',
      populate: {
        path: 'instructor',
        select: 'name profilePicture'
      }
    })
    .sort('-enrolledAt');
    
    const courses = enrollments.map(enrollment => ({
      ...enrollment.course.toObject(),
      enrollmentId: enrollment._id,
      progress: enrollment.progress,
      enrolledAt: enrollment.enrolledAt,
      lastAccessedAt: enrollment.lastAccessedAt
    }));
    
    res.status(200).json({
      success: true,
      count: courses.length,
      courses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching enrolled courses',
      error: error.message
    });
  }
};

// @desc    Get enrolled course with lessons
// @route   GET /api/courses/enrolled/:id
// @access  Private
const getEnrolledCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
      status: { $in: ['paid', 'active', 'completed'] }
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to access this course'
      });
    }

    const course = await Course.findById(courseId)
      .populate('instructor', 'name email profilePicture');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const progressRecords = await Progress.find({
      student: studentId,
      course: courseId
    });

    const lessonsWithProgress = course.lessons.map(lesson => {
      const lessonProgress = progressRecords.find(
        p => p.lessonId.toString() === lesson._id.toString()
      );
      return {
        ...lesson.toObject(),
        progress: lessonProgress ? lessonProgress.videoProgress : 0,
        isCompleted: lessonProgress ? lessonProgress.isCompleted : false
      };
    });

    res.status(200).json({
      success: true,
      course: {
        ...course.toObject(),
        lessons: lessonsWithProgress
      },
      enrollment: {
        progress: enrollment.progress,
        completedLessons: enrollment.completedLessons,
        lastAccessedLesson: enrollment.lastAccessedLesson
      }
    });

  } catch (error) {
    console.error('Get enrolled course error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message
    });
  }
};

// @desc    Get all courses for admin
// @route   GET /api/courses/admin/all
// @access  Private/Admin
const getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate('instructor', 'name email')
      .sort('-createdAt');

    // Get enrollment stats for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        const enrollmentCount = await Enrollment.countDocuments({
          course: course._id
        });
        const completedCount = await Enrollment.countDocuments({
          course: course._id,
          status: 'completed'
        });
        const revenue = enrollmentCount * course.price;

        return {
          ...course.toObject(),
          enrollmentCount,
          completedCount,
          revenue
        };
      })
    );

    res.status(200).json({
      success: true,
      count: courses.length,
      courses: coursesWithStats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message
    });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message
    });
  }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Delete related data
    await Enrollment.deleteMany({ course: req.params.id });
    await Certificate.deleteMany({ course: req.params.id });
    await Assignment.deleteMany({ course: req.params.id });

    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Course and related data deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message
    });
  }
};

module.exports = {
  getAllCourses,
  getCourse,
  createCourse,
  getMyEnrolledCourses,
  getEnrolledCourse,
  getAllCoursesAdmin,
  updateCourse,
  deleteCourse
};
