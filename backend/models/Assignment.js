const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Assignment description is required']
  },
  instructions: {
    type: String,
    required: true
  },
  maxScore: {
    type: Number,
    default: 100,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true
  },
  attachments: [String], // URLs to reference materials
  allowedFileTypes: {
    type: [String],
    default: ['pdf', 'doc', 'docx', 'txt', 'zip']
  },
  maxFileSize: {
    type: Number,
    default: 10 // in MB
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
