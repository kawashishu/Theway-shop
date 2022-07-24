const express = require('express');

const router = express.Router();
const manaCon = require('./controller');
/* GET users listing. */
router.get('/manager',manaCon.manager);
router.get('/profile', manaCon.profile);
router.post('/profile', manaCon.postSave);
router.get('/manager/add', manaCon.getAdd);
router.post('/manager/add', manaCon.postAdd);
module.exports = router;
