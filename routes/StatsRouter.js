const express = require('express');
const router = express.Router();
const statsController = require('../controllers/StatsController');

router.route('/').get(statsController.getGeneralStats);

module.exports = router;
