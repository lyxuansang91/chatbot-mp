/*eslint-disable */
const express = require('express');
const controller = require('../../controllers/webhook.controller');
const oAuthLogin = require('../../middlewares/auth').oAuth;
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');
const { login, register, oAuth, refresh } = require('../../validations/auth.validation');

const router = express.Router();

router
  // .get('/', controller.get)
  .post('/', controller.get);

module.exports = router;
