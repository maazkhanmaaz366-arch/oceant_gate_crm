const express = require('express');
const router = express.Router();
const contentPostController = require('./contentPost.controller');

router.get('/', contentPostController.getPosts);
router.post('/', contentPostController.createPost);
router.post('/ai-generate', contentPostController.generateAiContent);
router.put('/:id', contentPostController.updatePost);
router.delete('/:id', contentPostController.deletePost);
router.post('/:id/publish', contentPostController.publishPost);

module.exports = router;
