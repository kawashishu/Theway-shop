const express = require('express');
const { route } = require('../../app');
const router = express.Router();
const controller = require('./controller');
/* GET home page. */
router.post('/exist',controller.accExist)
router.post('/resend', controller.resend);
router.post('/forgot',controller.forgot);
router.post('/wishlist',controller.postWishList);
router.get('/:user_id/wishlist',controller.getWishList);
router.get('/:user_id/cart',controller.getCart);
router.post('/cart',controller.postCart);
router.put('/cart',controller.updateCart);
router.delete('/cart',controller.delCart);
router.post('/placeorder', controller.placeorder)
router.get('/get_infor_order/:user_id', controller.loadMore)
router.get('/order/:order_id',controller.getOrderPro);
router.delete('/:user_id/order/:order_id',controller.cancelOrder);
module.exports = router;
