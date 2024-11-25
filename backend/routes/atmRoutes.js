const express = require('express');
const router = express.Router();
const { authenticateCustomer, withdrawCash } = require('../controllers/atmController');

router.post('/authenticate', authenticateCustomer);
router.post('/withdraw', withdrawCash);

module.exports = router;
