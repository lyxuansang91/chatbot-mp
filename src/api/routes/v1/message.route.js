/*eslint-disable */
const express = require('express');
const controller = require('../../controllers/message.controller');
const validate = require('express-validation');  

const {
  getMessage,
} = require('../../validations/message.validation');

const router = express.Router();

router
  .get('/', validate(getMessage),controller.getMessageHistory)
  .post('/', controller.send);

router
  .post('/media', controller.uploadMedia);

module.exports = router;
