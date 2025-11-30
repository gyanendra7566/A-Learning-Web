const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
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
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date,
    required: true
  },
  grade: {
    type: String,
    enum: ['A+', 'A', 'B+', 'B', 'C', 'Pass', 'Excellent'],
    default: 'Pass'
  },
  verificationUrl: String,
  pdfUrl: String, // In production, store in cloud storage
  isValid: {
    type: Boolean,
    default: true
  },
  revokedAt: Date,
  revokedReason: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate certificates
certificateSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
