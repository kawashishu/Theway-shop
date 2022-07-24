const express = require('express');

const router = express.Router();
const controller = require('./controller');
/* GET users listing. */
router.get('/',controller.getProductPage)
router.get('/search',controller.searchProduct);
module.exports = router;
