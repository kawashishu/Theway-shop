const express = require('express');
const router = express.Router();
const productCon = require('./controller')
/* GET home page. */
router.get('/',productCon.get)
router.get('/add',productCon.getAddProduct);
router.post('/add',productCon.postAddProduct);
router.get('/search',productCon.searchProduct);
router.get('/delete/:id',productCon.delete);
router.get('/:product_id',productCon.getProduct);
router.post('/:product_id',productCon.postProduct);

module.exports = router;
    