const express = require('express');
const router = express.Router();
const shopCon = require('./controller');


/* GET home page. */
router.get('/ourservice', shopCon.ourservice);
router.get('/contactus', shopCon.contactus);
module.exports = router;
