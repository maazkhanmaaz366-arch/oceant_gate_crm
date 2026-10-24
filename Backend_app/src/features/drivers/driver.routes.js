const express = require('express');
const router = express.Router();
const driverController = require('./driver.controller');

router.get('/', driverController.getDrivers);
router.get('/:id', driverController.getDriver);
router.post('/', driverController.createDriver);
router.put('/:id', driverController.updateDriver);
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
