const express = require('express');
const router = express.Router();

const accRoute = require('./account/route')
const proRoute = require('./product/route')
/* GET home page. */
router.use('/account', accRoute);
router.use('/product',proRoute);
module.exports = router;
