const express = require('express');

const router = express.Router();
const controller = require('./controller');
/* GET users listing. */
router.get('/order_product/:order_id',controller.orderProduct);
router.post('/set_state',controller.setState);
module.exports = router;
