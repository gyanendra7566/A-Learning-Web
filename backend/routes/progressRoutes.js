const express = require('express');
const router = express.Router();
const {
  updateProgress,
  getLessonProgress,
  getCourseProgress,
  markLessonComplete
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.use(protect); // All routes require authentication

router.post('/update', updateProgress);
router.post('/complete', markLessonComplete);
router.get('/course/:courseId', getCourseProgress);
router.get('/:courseId/:lessonId', getLessonProgress);

module.exports = router;
