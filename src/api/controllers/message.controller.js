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

exports.send = async (req, res) => {
  try {
    const thumbnail = req.file;
    const fields = req.body;

    console.log("req.fields", req.body);
    console.log("========================");
    console.log("req.files", req.file);
    console.log("========================");

    // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.
    let linkthumb = null;
    if (thumbnail) {
      // handle upload file
      const uploadedFileName =
        shortid.generate() + path.parse(thumbnail.originalname).ext;
      linkthumb =
        (process.env.NODE_ENV === "development"
          ? req.protocol + "://" + req.get("host")
          : process.env.BASE_URL) +
        "/uploads/" +
        uploadedFileName;

      fs.rename(thumbnail.path, "./uploads/" + uploadedFileName, function(err) {
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

    const userIds = user_ids ? _.uniq(JSON.parse(user_ids)) : [];

    if (userIds.length === 0) {
      const users = await ZaloUser.list({
        page: 1,
        perPage: 100
      });

      users.forEach(async user => {
        let sentMessage = null;
        const uid = user.fromuid;
        switch (type) {
          case "text":
            sentMessage = await sendTextMessage(uid, message);
            break;
          case "text_link":
            sentMessage = await sendTextLink(
              uid,
              link,
              linktitle,
              linkdes,
              linkthumb
            );
            break;
        }

        console.log("Sent message:", JSON.stringify(sentMessage));
      });
    } else {
      userIds.forEach(async uid => {
        let sentMessage = null;

        switch (type) {
          case "text":
            sentMessage = await sendTextMessage(uid, message);
            break;
          case "text_link":
            sentMessage = await sendTextLink(
              uid,
              link,
              linktitle,
              linkdes,
              linkthumb
            );
            break;
        }

        console.log("Sent message:", JSON.stringify(sentMessage));
      });
    }

    res.json({
      status: "success"
    });
  } catch (error) {
    console.log("error", error);
    res.json({
      status: "failed",
      message: error.message
    });
  }
};

exports.sendToUser = async (req, res) => {
  try {
    const thumbnail = req.file;
    const fields = req.body;

    console.log("req.fields", req.body);
    console.log("========================");
    console.log("req.files", req.file);
    console.log("========================");

    // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.
    let linkthumb = null;
    if (thumbnail) {
      // handle upload file
      const uploadedFileName =
        shortid.generate() + path.parse(thumbnail.originalname).ext;
      linkthumb =
        (process.env.NODE_ENV === "development"
          ? req.protocol + "://" + req.get("host")
          : process.env.BASE_URL) +
        "/uploads/" +
        uploadedFileName;

      fs.rename(thumbnail.path, "./uploads/" + uploadedFileName, function(err) {
        if (err) {
          console.error(err.message);
        }
      });
    }

    const {
      type,
      link,
      message,
      title: linktitle,
      description: linkdes
    } = fields;

    const uid = req.params.id;

    let sentMessage = null;

    if (uid) {
      switch (type) {
        case "text":
          sentMessage = await sendTextMessage(uid, message);
          break;
        case "text_link":
          sentMessage = await sendTextLink(
            uid,
            link,
            linktitle,
            linkdes,
            linkthumb
          );
          break;
      }
      console.log("Sent message:", JSON.stringify({ sentMessage }));

      res.json({
        status: "success",
        message: sentMessage ? sentMessage.transform() : null
      });
    } else {
      res.json({
        status: "failed",
        message: "Không thể gửi tin nhắn!"
      });
    }

  } catch (error) {
    console.log("error", error);
    res.json({
      status: "failed",
      message: error.message
    });
  }
};

exports.uploadMedia = async (req, res) => {
  try {
    uploadMedia();

    res.json({
      status: "success"
    });
  } catch (error) {
    res.json({
      status: "failed",
      message: error.message
    });
  }
};

exports.getMessageHistory = async (req, res) => {
  try {
    let { page, limit: perPage, userId: uid, status } = req.query;
    page = page ? Number(page) : 1;
    perPage = perPage ? Number(perPage) : 100;

    const messageCount = await Message.countMessages({ uid, status });

    console.log("messageCount", messageCount);

    const messages = await Message.list({
      page,
      perPage,
      uid,
      status
    });
    const transformedMessages = messages.map(message => message.transform());

    res.json({
      status: "success",
      data: transformedMessages,
      page: page,
      totalPages: Math.ceil(messageCount / perPage)
    });
  } catch (error) {
    res.json({
      status: "failed",
      message: error.message
    });
  }
};

uploadMedia = async () => {
  var fileUrl =
    "https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg";
  ZaloClient.api(
    "upload/image",
    "POST",
    {
      file: fileUrl
    },
    function(response) {}
  );
};

sendTextMessage = async (uid, message) => {
  const response = await ZaloClient.api("sendmessage/text", "POST", {
    uid,
    message
  });
  console.log("ZaloResponse-sendTextMessage", response);
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
    await msg.save();
    return msg;
  } else {
    const data = {
      zaloMessageId: null,
      uid,
      messageType: "text",
      message,
      status: "failed"
    };
    const msg = new Message(data);
    await msg.save();
    return msg;
  }
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

  const response = await ZaloClient.api("sendmessage/links", "POST", {
    uid,
    ...message
  });
  console.log("ZaloResponse-sendTextLink", response);
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
    await msg.save();
    return msg;
  } else {
    const data = {
      zaloMessageId: null,
      uid,
      messageType: "text_link",
      message: JSON.stringify(message),
      status: "failed"
    };
    const msg = new Message(data);
    await msg.save();
    return msg;
  }
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
