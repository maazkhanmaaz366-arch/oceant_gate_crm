const express = require('express');
const router = express.Router();
const jobController = require('./job.controller');
const authMiddleware = require('../../middlewares/authMiddleware');

// Operations can be viewed by Owner, Admin, Operations
router.get('/', authMiddleware(['Owner', 'Admin', 'Operations', 'Guest']), jobController.getJobs);
router.post('/', authMiddleware(['Owner', 'Admin', 'Operations']), jobController.createJob);

// Update job (Accessible by Operations, Admin)
router.put('/:id', authMiddleware(['Owner', 'Admin', 'Operations']), jobController.updateJob);
router.delete('/:id', authMiddleware(['Owner', 'Admin', 'Operations', 'Guest']), jobController.deleteJob);

module.exports = router;
