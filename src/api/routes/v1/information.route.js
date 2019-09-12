/*eslint-disable */
const express = require('express');
const controller = require('../../controllers/information.controller');

const router = express.Router();

router.get('/', controller.getInformation);

module.exports = router;
