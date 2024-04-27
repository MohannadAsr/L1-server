const express = require('express');

const router = express.Router();
const BillsController = require('../controllers/BillsController');
const StatsController = require('../controllers/StatsController');

router.route('/').get(BillsController.getAllBills);
router.route('/stats').get(StatsController.getBillsStats);

module.exports = router;
