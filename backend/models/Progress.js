const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  videoProgress: {
    type: Number,
    default: 0, // seconds watched
    min: 0
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  lastWatched: {
    type: Date,
    default: Date.now
  },
  totalDuration: {
    type: Number, // total video duration in seconds
    default: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one progress record per student per lesson
progressSchema.index({ student: 1, course: 1, lessonId: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);
