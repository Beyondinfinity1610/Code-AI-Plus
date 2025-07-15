const express = require('express');
const {
  explainError,
  answerQuestion,
  improveCode
} = require('../controllers/aiController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/explain-error', explainError);
router.post('/answer-question', answerQuestion);
router.post('/improve-code', improveCode);

module.exports = router;
