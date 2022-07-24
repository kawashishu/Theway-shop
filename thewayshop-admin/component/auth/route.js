const express = require('express');

const router = express.Router();
const authCon = require('./controller');

/* GET users listing. */
router.get('/login', authCon.loginGet);
router.post('/login', authCon.loginPost);
router.get('/logout', authCon.logout);


module.exports = router;
