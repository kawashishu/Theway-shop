const express = require('express');
const router = express.Router();
const accCon = require('./controller');

/* GET home page. */
router.get('/', accCon.myaccount);
router.get('/profile',accCon.profile);
router.post('/profile',accCon.editProfile);
router.get('/changepass', accCon.changepass);
router.post('/changepass', accCon.postchangepass);
router.get('/cart', accCon.cart);
router.get('/wishlist', accCon.wishlist);
router.get('/checkout', accCon.checkout);
router.get('/yourorder', accCon.yourorder);
router.get('/status', accCon.status);
router.post('/confirm',accCon.confirm);
module.exports = router;
