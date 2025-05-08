const express = require('express');
const router = express.Router();
const { addMenuItem } = require('../controllers/menuController');

router.post('/menu', addMenuItem);

module.exports = router;
