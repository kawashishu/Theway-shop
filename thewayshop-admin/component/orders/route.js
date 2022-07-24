const express = require('express');
const router = express.Router();
const tableCon = require('./controller');
/* GET users listing. */
router.get('/', tableCon.viewOrders);
router.get('/edit', tableCon.editOrders);
router.get('/view', tableCon.viewOrder);

module.exports = router;