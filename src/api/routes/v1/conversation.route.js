/*eslint-disable */
const express = require('express');
const controller = require('../../controllers/conversation.controller');
const validate = require('express-validation');
const { authorize, ADMIN, LOGGED_USER } = require('../../middlewares/auth');

const { getConversations } = require('../../validations/conversation.validation');

const router = express.Router();

router
  /**
   * @api {get} v1/conversations List Zalo conversations
   * @apiDescription Get a list Zalo conversations that's already sent to users
   * @apiVersion 1.0.0
   * @apiName Get conversations
   * @apiGroup Zalo
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [limit=100]  Users per page
   * @apiParam  {String=follow,unfollow}             [status]      User's status
   *
   * @apiSuccess {String=follow,unfollow}  status         Response's status
   * @apiSuccess {Object[]} data   List of Zalo conversations.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(
    "/",
    authorize(ADMIN),
    validate(getConversations),
    controller.getConversations
  );


router
  .route("/:id")
  .get(authorize(LOGGED_USER), controller.getConversationDetail);

module.exports = router;
