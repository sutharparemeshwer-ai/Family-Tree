const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const socialController = require('../controllers/socialController');

// Posts (News Feed)
router.post('/posts', authMiddleware, socialController.createPost);
router.get('/feed', authMiddleware, socialController.getFeed);

// Comments
router.post('/memories/:memoryId/comments', authMiddleware, socialController.addComment);
router.get('/memories/:memoryId/comments', authMiddleware, socialController.getComments);

module.exports = router;
