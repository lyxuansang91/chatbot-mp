/*eslint-disable */
const express = require("express");
const controller = require("../../controllers/stock.controller");
const validate = require("express-validation");
const { authorize, ADMIN, LOGGED_USER } = require("../../middlewares/auth");

const {
  getStock,
} = require("../../validations/stock.validation");

const router = express.Router();

const multer = require("multer");
const shortid = require("shortid");
const path = require("path");
const upload = multer({
  storage: multer.diskStorage({
    filename: function(req, file, cb) {
      // user shortid.generate() alone if no extension is needed
      cb(null, shortid.generate() + path.parse(file.originalname).ext);
    }
  })
}).single("data");

router
  .get("/", authorize(ADMIN), validate(getStock), controller.list)
  .post("/", authorize(ADMIN), upload, controller.create);


// router.route("/:id").post(authorize(ADMIN), upload, controller.sendToUser);

module.exports = router;
