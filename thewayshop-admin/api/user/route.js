const express = require('express');

const router = express.Router();
const controller = require('./controller');
/* GET users listing. */
router.post('/block',controller.block);

module.exports = router;
