/*eslint-disable */

const httpStatus = require("http-status");
const { omit } = require("lodash");
var request = require("request");
const axios = require("axios");
const shortid = require("shortid");
const path = require("path");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

const ZaloClient = require("../services/zaloService").ZaloClient;
const ZaloUser = require("../models/zalouser.model");
const Message = require("../models/message.model");

const multer = require("multer");
const upload = multer({
  storage: multer.diskStorage({
    destination: "./uploads/",
    filename: function(req, file, cb) {
      // user shortid.generate() alone if no extension is needed
      cb(null, shortid.generate() + path.parse(file.originalname).ext);
    }
  })
}).single("file");

exports.send = async (req, res) => {
  try {
    var form = new formidable.IncomingForm();

    const files = req.fiels;
    const fields = req.fields;

    console.log("req.fields", req.fields);
    console.log("========================")
    console.log("req.files", req.files);
    console.log("========================");

    // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.
    let linkthumb = null;
    if (files.file) {
      // handle upload file
      const uploadedFileName =
        shortid.generate() + path.parse(files.file.name).ext;
      linkthumb =
        (process.env.NODE_ENV === "development"
          ? req.protocol + "://" + req.get("host")
          : process.env.BASE_URL) +
        "/uploads/" +
        uploadedFileName;

      fs.rename(files.file.path, "./uploads/" + uploadedFileName, function(
        err
      ) {
        if (err) {
          console.error(err.message);
        }
      });
    }

    const {
      user_ids,
      type,
      link,
      message,
      title: linktitle,
      description: linkdes
    } = fields;

    const userIds = _.uniq(JSON.parse(user_ids));

    if (!userIds) {
      const users = await ZaloUser.list({ page: 1, perPage: 100 });

      users.forEach(user => {
        const uid = user.fromuid;
        switch (type) {
          case "text":
            sendTextMessage(uid, message);
            break;
          case "text_link":
            sendTextLink(uid, link, linktitle, linkdes, linkthumb);
            break;
        }

        console.log(
          "Send message:",
          JSON.stringify({
            user_ids: uid,
            type,
            link,
            title: linktitle,
            description: linkdes,
            thumbnail: linkthumb
          })
        );
      });
    } else {
      userIds.forEach(uid => {
        switch (type) {
          case "text":
            sendTextMessage(uid, message);
            break;
          case "text_link":
            sendTextLink(uid, link, linktitle, linkdes, linkthumb);
            break;
        }

        console.log(
          "Send message:",
          JSON.stringify({
            user_ids: uid,
            type,
            link,
            title: linktitle,
            description: linkdes,
            thumbnail: linkthumb
          })
        );
      });
    }

    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    uploadMedia();

    res.json({ status: "success" });
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

exports.getMessageHistory = async (req, res) => {
  try {
    let { page, limit: perPage, user_id: fromuid, status } = req.query;
    page = page ? Number(page) : 1;
    perPage = perPage ? Number(perPage) : 100;

    const messages = await Message.list({ page, perPage, fromuid, status });
    const transformedMessages = messages.map(message => message.transform());

    res.json({ status: "success", data: transformedMessages });
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};

uploadMedia = async () => {
  var fileUrl =
    "https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg";
  ZaloClient.api("upload/image", "POST", { file: fileUrl }, function(
    response
  ) {});
};

sendTextMessage = async (uid, message) => {
  ZaloClient.api("sendmessage/text", "POST", { uid, message }, function(
    response
  ) {
    if (response.data && response.data.msgId) {
      const zaloMessageId = response.data.msgId;
      const data = {
        zaloMessageId,
        uid,
        messageType: "text",
        message,
        status: response.errorMsg === "Success" ? "success" : "failed"
      };
      const msg = new Message(data);
      msg.save();
    } else {
      const data = {
        zaloMessageId: null,
        uid,
        messageType: "text",
        message,
        status: "failed"
      };
      const msg = new Message(data);
      msg.save();
    }
  });
};

sendTextLink = async (uid, link, linktitle, linkdes, linkthumb) => {
  var message = {
    links: [
      {
        link,
        linktitle,
        linkdes,
        linkthumb
      }
    ]
  };

  ZaloClient.api("sendmessage/links", "POST", { uid, ...message }, function(
    response
  ) {
    console.log("response:", response);
    if (response.data && response.data.msgId) {
      const zaloMessageId = response.data.msgId;
      const data = {
        zaloMessageId,
        uid,
        messageType: "text_link",
        message: JSON.stringify(message),
        status: response.errorMsg === "Success" ? "success" : "failed"
      };
      const msg = new Message(data);
      msg.save();
    } else {
      const data = {
        zaloMessageId: null,
        uid,
        messageType: "text_link",
        message: JSON.stringify(message),
        status: "failed"
      };
      const msg = new Message(data);
      msg.save();
    }
  });
};

// sendInteractiveMessage = async uid => {
//   var params = {
//     uid: uid,
//     actionlist: [
//       {
//         action: "oa.open.inapp",
//         title: "Send interactive messages",
//         description: "This is a test for API send interactive messages",
//         thumb: "https://developers.zalo.me/web/static/prodution/images/bg.jpg",
//         href: "https://developers.zalo.me",
//         data: "https://developers.zalo.me",
//         popup: {
//           title: "Open Website Zalo For Developers",
//           desc: "Click ok to visit Zalo For Developers and read more Document",
//           ok: "ok",
//           cancel: "cancel"
//         }
//       }
//     ]
//   };
//   ZaloClient.api("sendmessage/actionlist", "POST", params, function(
//     response
//   ) {});
// };
