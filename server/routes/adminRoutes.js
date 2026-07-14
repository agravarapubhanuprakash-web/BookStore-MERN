const express = require('express');
const {
  getDashboardStats,
  exportBooksCSV,
  importBooksCSV,
  getActivityLog,
  getAllUsers,
  updateUserRole,
  toggleUserBlock
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardStats);
router.get('/export-books', exportBooksCSV);
router.post('/import-books', upload.single('file'), importBooksCSV);
router.get('/activity-log', getActivityLog);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/block', toggleUserBlock);

module.exports = router;
