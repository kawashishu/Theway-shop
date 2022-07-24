const express = require('express');
const app = require('../../app');
const router = express.Router();

const indexCon = require('./controller')
/* GET home page. */
router.get('/', indexCon.homePage);
router.get('/search',indexCon.search)
module.exports = router;

