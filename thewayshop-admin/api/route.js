const express = require('express');

const router = express.Router();
const userRoute = require('./user/route')
const productRoute = require('./product/route');
const dashBoardRoute = require('./dashboard/route');
const orderRoute = require('./order/route');
/* GET users listing. */
router.use('/user',userRoute);
router.use('/product',productRoute);
router.use('/dashboard',dashBoardRoute);
router.use('/order',orderRoute)
module.exports = router;
