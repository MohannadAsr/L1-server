const express = require('express');

const router = express.Router();
const BillsController = require('../controllers/BillsController');

router.route('/').get(BillsController.getAllBills);

module.exports = router;
