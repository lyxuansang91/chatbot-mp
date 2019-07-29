/*eslint-disable */
const express = require('express');
const controller = require('../../controllers/file.controller');
const oAuthLogin = require('../../middlewares/auth').oAuth;
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');


const router = express.Router();

router
  .post('/upload', controller.upload);

module.exports = router;
