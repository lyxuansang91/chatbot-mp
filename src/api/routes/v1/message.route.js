/*eslint-disable */
const express = require('express');
const controller = require('../../controllers/message.controller');
const validate = require('express-validation');  
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');

const {
  getMessage,
} = require('../../validations/message.validation');

const router = express.Router();

router
  .get('/', authorize(ADMIN), validate(getMessage),controller.getMessageHistory)
  .post('/', authorize(ADMIN), controller.send);

router
  .post('/media', authorize(ADMIN), controller.uploadMedia);

module.exports = router;
