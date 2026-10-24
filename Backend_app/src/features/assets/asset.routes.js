const express = require('express');
const router = express.Router();
const assetController = require('./asset.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

router.post('/', authMiddleware(['Owner', 'Admin', 'Marketing', 'Sales', 'Guest']), assetController.createAsset);
router.post('/ai-generate', authMiddleware(['Owner', 'Admin', 'Marketing', 'Sales', 'Guest']), assetController.generateAiAsset);
router.get('/', authMiddleware(['Owner', 'Admin', 'Marketing', 'Sales', 'Guest']), assetController.getAssets);
router.delete('/:id', authMiddleware(['Owner', 'Admin', 'Marketing', 'Sales', 'Guest']), assetController.deleteAsset);

module.exports = router;

