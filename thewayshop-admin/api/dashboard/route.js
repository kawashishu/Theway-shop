const express = require('express');
const router = express.Router();
const dashboardCon = require('./controller')

/* GET home page. */
router.get('/topsellingproduct',dashboardCon.getTopSellingProductByTag);

module.exports = router;