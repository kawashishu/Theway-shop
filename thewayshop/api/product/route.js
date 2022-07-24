const express = require('express');
const router = express.Router();

const controller = require('./controller')
/* GET home page. */
router.get('/',controller.getProduct);
router.get('/tag/:tag_name',controller.filterTag);
router.get('/category/:category_name',controller.filterCategory);
router.get('/rating', controller.getRating);
router.post('/rating', controller.postRating);
router.get('/comment', controller.getComment);
router.post('/comment', controller.postComment);
router.get('/search', controller.searchProduct);



module.exports = router;
