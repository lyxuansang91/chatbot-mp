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
const PendingMessage = require("../models/pedingMessage.model");

const AWS = require("aws-sdk");

// Configure client for use with Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY
});

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

      // Add a file to a Space
      var params = {
        Body: fs.createReadStream(thumbnail.path),
        Bucket: "gcapai",
        Key: uploadedFileName,
        ACL: "public-read"
      };

      const s3Res = await s3.putObject(params).promise();
      if (s3Res && s3Res.ETag) {
        linkthumb = process.env.SPACES_BASE_URL + uploadedFileName;
      } else {
        linkthumb = null;
      }

      console.log("linkthumb", linkthumb);
    }

    const {
      user_ids,
      type,
      link,
      message,
      title: linktitle,
      description: linkdes
    } = fields;

    const userIds = user_ids ? _.uniq(JSON.parse(user_ids)) : null;

    let messageObject = null;
    switch (type) {
      case "text":
        messageObject = JSON.stringify(message);
        break;
      case "text_link":
        messageObject = JSON.stringify({
          links: [
            {
              link,
              linktitle,
              linkdes,
              linkthumb
            }
          ]
        });
    }

    const result = await savePendingMessage(userIds, type, messageObject);

    if (result) {
      res.json({
        status: "success",
        message: result.transform()
      });
    } else {
      res.json({
        status: "failed",
        message: "Không thể khởi tạo tin nhắn"
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

exports.getListPendingMessages = async (req, res) => {
  try {
    let { page, limit: perPage, status } = req.query;
    page = page ? Number(page) : 1;
    perPage = perPage ? Number(perPage) : 100;

    const messageCount = await PendingMessage.countMessages({ status });

    console.log("messageCount", messageCount);

    const messages = await PendingMessage.list({
      page,
      perPage,
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

exports.approve = async (req, res) => {
  try {
    const messageId = req.params.id;

    const pendingMessage = await PendingMessage.findById(messageId);

    if (pendingMessage) {
      const userIds = pendingMessage.recipients ? JSON.parse(
        pendingMessage.recipients
      ) : null;
      const messageType = pendingMessage.messageType;
      const message = pendingMessage.message
        ? JSON.parse(pendingMessage.message)
        : null;

      if (!userIds) {
        const users = await ZaloUser.list({
          page: 1,
          perPage: 1000
        });

        users.forEach(async user => {
          let sentMessage = null;
          const uid = user.fromuid;
          switch (messageType) {
            case "text":
              sentMessage = await sendTextMessage(uid, message);
              break;
            case "text_link":
              sentMessage = await sendTextLinkWrapper(uid, message);
              break;
          }
          console.log("Sent message:", JSON.stringify(sentMessage));
        });
      } else {
        userIds.forEach(async uid => {
          let sentMessage = null;

          switch (messageType) {
            case "text":
              sentMessage = await sendTextLinkWrapper(uid, message);
              break;
            case "text_link":
              sentMessage = await sendTextLink(uid, message);
              break;
          }
          console.log("Sent message:", JSON.stringify(sentMessage));
        });
      }

      pendingMessage.status = 'approved'
      const result = await pendingMessage.save()

      if (result)
        res.json({
          status: "success"
        });

    } else {
      res.json({
        status: "failed",
        message: "Không tìm thấy tin nhắn"
      });
    }
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

sendTextLinkWrapper = async (uid, message) => {
  const response = await ZaloClient.api("sendmessage/links", "POST", {
    uid,
    ...message
  });
  console.log("ZaloResponse-sendTextLinkWrapper", response);
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

savePendingMessage = (recipients, messageType, message, status = "pending") => {
  const data = { recipients, messageType, message, status };
  const pendingMessage = new PendingMessage(data);
  return pendingMessage.save();
};
