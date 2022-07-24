const express = require('express');
const router = express.Router();
const tableCon = require('./controller');
/* GET users listing. */
router.get('/:tb_name', tableCon.viewTable);
router.get('/:tb_name/edit', tableCon.editTable);
router.post('/:tb_name/edit', tableCon.postEditTable);

module.exports = router;
