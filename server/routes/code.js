const express = require('express');
const {
  createCode,
  getCodes,
  getCode,
  updateCode,
  deleteCode,
  runCode,
  getStats,
  loadCodeById
} = require('../controllers/codeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createCode);
router.get('/', getCodes);
router.get('/stats', getStats);
router.get('/:id', getCode);
router.get('/load/:id', loadCodeById);  // Add this route
router.put('/:id', updateCode);
router.delete('/:id', deleteCode);
router.post('/run', runCode);

module.exports = router;
