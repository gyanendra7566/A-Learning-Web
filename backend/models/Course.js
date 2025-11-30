const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  videoUrl: {
    type: String,
    required: true
  },
  duration: Number, // in minutes
  order: {
    type: Number,
    required: true
  },
  resources: [String],
  isPreview: {
    type: Boolean,
    default: false
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Course description is required']
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'Design', 'Business', 'Marketing', 'Data Science', 'Other']
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  thumbnail: {
    type: String,
    default: 'https://via.placeholder.com/400x225/4f46e5/ffffff?text=Course'
  },
  syllabus: [String],
  duration: Number, // total duration in hours
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  enrolledStudents: {
    type: Number,
    default: 0
  },
  lessons: [lessonSchema],
  isApproved: {
    type: Boolean,
    default: true // Auto-approve for now
  },
  tags: [String],
  language: {
    type: String,
    default: 'English'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
