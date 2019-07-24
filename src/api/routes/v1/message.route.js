/*eslint-disable */
const express = require('express');
const controller = require('../../controllers/message.controller');

const router = express.Router();

router
  .post('/', controller.send);

router
  .post('/media', controller.uploadMedia);

module.exports = router;
