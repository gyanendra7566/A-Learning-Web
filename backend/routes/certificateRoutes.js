const express = require('express');
const router = express.Router();
const {
  generateCertificateForStudent,
  getMyCertificates,
  getCertificate,
  verifyCertificate,
  downloadCertificate
} = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/verify/:certificateId', verifyCertificate);

// Protected routes
router.use(protect);

router.post('/generate', generateCertificateForStudent);
router.get('/my-certificates', getMyCertificates);
router.get('/:id', getCertificate);
router.get('/:id/download', downloadCertificate);

module.exports = router;
