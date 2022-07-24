const express = require('express');
const router = express.Router();
const controller = require('./controller');
/* GET home page. */
router.get('/login', controller.login);
router.get('/logout',controller.logout);
router.post('/login',controller.verify,controller.auth);
router.get('/register', controller.getRegister);
router.post('/register', controller.register);
router.get('/confirmation/:token', controller.confirm);
router.get('/changepass/:token', controller.changepass);
router.post('/changepass/:token', controller.postChangepass);
module.exports = router;
