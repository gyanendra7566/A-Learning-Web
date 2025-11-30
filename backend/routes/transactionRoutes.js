const express = require('express');
const router = express.Router();
const {
  getAllTransactions,
  getTransactionStats,
  getTransactionById
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin authorization
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllTransactions);
router.get('/stats', getTransactionStats);
router.get('/:id', getTransactionById);

module.exports = router;
