/*eslint-disable */
const express = require("express");
const controller = require("../../controllers/message.controller");
const validate = require("express-validation");
const { authorize, ADMIN, LOGGED_USER } = require("../../middlewares/auth");

const { getMessage } = require("../../validations/message.validation");

const router = express.Router();

const multer = require("multer");
const shortid = require("shortid");
const path = require("path");
const upload = multer({
  storage: multer.diskStorage({
    destination: global.__basedir + "/uploads/",
    filename: function(req, file, cb) {
      // user shortid.generate() alone if no extension is needed
      cb(null, shortid.generate() + path.parse(file.originalname).ext);
    }
  })
}).single("thumbnail");

router
  /**
   * @api {get} v1/messages List Zalo messages
   * @apiDescription Get a list Zalo messages that's already sent to users
   * @apiVersion 1.0.0
   * @apiName Get messages
   * @apiGroup Zalo
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   *
   * @apiParam  {Number{1}}         [page=1]     List page
   * @apiParam  {Number{1-100}}      [limit=100]  Users per page
   * @apiParam  {String}             [user_id]       User's id
   * @apiParam  {String=success,failed}             [status]      User's status
   *
   * @apiSuccess {String=success,failed}  status         Response's status
   * @apiSuccess {Object[]} data   List of Zalo messages.
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .get(
    "/",
    authorize(ADMIN),
    validate(getMessage),
    controller.getMessageHistory
  )
  /**
   * @api {post} v1/messages Send Zalo messages
   * @apiDescription Send Zalo message to users
   * @apiVersion 1.0.0
   * @apiName Send message
   * @apiGroup Zalo
   * @apiPermission admin
   *
   * @apiHeader {String} Authorization   User's access token
   * @apiHeader {String} Content-Type   multipart/form-data
   *
   * @apiParam  {Array}               [user_ids]     List of user ids to send message. Set null if you want to send to all users
   * @apiParam  {String=text,text_link}              [type]      Type of message
   * @apiParam  {String}              [message]      Message content if user sends text message
   * @apiParam  {String}             [link]          Message's link
   * @apiParam  {String}             [description]          Message's description
   * @apiParam  {File}             [thumbnail]          Message's thumbnail file path
   *
   * @apiSuccess (Created 201) {String=success,failed}  status         Response's status
   *
   * @apiError (Unauthorized 401)  Unauthorized  Only authenticated users can access the data
   * @apiError (Forbidden 403)     Forbidden     Only admins can access the data
   */
  .post("/", authorize(ADMIN), upload, controller.send);

router.route("/:id").post(authorize(ADMIN), upload, controller.sendToUser);

router.post("/media", authorize(ADMIN), controller.uploadMedia);

module.exports = router;
