const express = require('express');
const router = express.Router();
const tableCon = require('./controller');

router.get('/user', tableCon.viewTable);
router.get('/user/block', tableCon.postBlock);
router.get('/user/info', tableCon.getUserInfo);
router.get('/user/return', tableCon.returnUser);
module.exports = router;