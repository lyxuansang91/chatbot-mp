/*eslint-disable */

const httpStatus = require("http-status");
const { omit } = require("lodash");
var ZaloOA = require("zalo-sdk").ZaloOA;
var request = require("request");
const axios = require("axios");

const ZaloClient = require("../services/zaloService").ZaloClient;
const ZaloUser = require("../models/zalouser.model");
const Message = require("../models/message.model");
const Stock = require("../models/stock.model");

const { getInformation } = require("../services/vietStockService");

exports.get = async (req, res) => {
  try {
    const event = req.body.event_name;

    switch (event) {
      case "follow":
        await handleFollow(req, res);
        break;
      case "unfollow":
        await handleUnfollow(req, res);
        break;
      case "user_send_text":
        await handleUserMessage(req, res);
        break;
    }

    res.end();
  } catch (error) {
    res.end(error);
  }
};

exports.create = async (req, res) => {
  console.log(req);
  res.end();
};

handleFollow = async (req, res) => {
  try {
    const zaloProfile = await ZaloClient.api("getprofile", {
      uid: req.body.follower.id
    });
    console.log("zaloProfile", zaloProfile.data);

    const data = {
      fromuid: req.body.follower.id,
      userIdByApp: req.body.user_id_by_app,
      phone: req.body.phone,
      appid: req.body.app_id,
      pageid: req.body.pageid,
      oaid: req.body.oa_id,
      status: "follow",
      ...zaloProfile.data
    };

    const checkUser = await ZaloUser.findByZaloUserId(data.fromuid);

    if (!checkUser) {
      const user = new ZaloUser(data);
      const savedZaloUser = await user.save();
      res.json({
        status: "created"
      });
    } else {
      if (checkUser.status !== "follow") {
        checkUser.status = "follow";
        Object.assign(checkUser, zaloProfile.data);
        await checkUser.save();
      }
      res.json({
        status: "updated"
      });
    }
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

handleUnfollow = async (req, res) => {
  try {
    const checkUser = await ZaloUser.findByZaloUserId(req.body.follower.id);

    if (checkUser) {
      checkUser.status = "unfollow";
      await checkUser.save();
      res.json({
        status: "updated"
      });
    }
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

handleUserMessage = async (req, res) => {
  const data = req.body;
  const message = data.message.text;
  const messageId = data.message.msg_id;
  const userId = data.sender.id;

  const query = analyzeQuery(message);

  console.log("analyzeQuery", query);

  switch (query.type) {
    case "*":
      processCoBan(userId, query.message);
      break;
    case "#":
      processTinTuc(userId, query.message);
      break;
    case "THONGTIN":
      break;
    case "EXPERT":
      break;
    default:
      break;
  }
};

handleMessage = async req => {
  console.log(req.body);
  var data = req.body;
  var message = data.message;
  var userId = data.fromuid;
  console.log(data);
  console.log("User", userId, "had send a message.", message);

  if (userId && message) {
    ZaloClient.api("getprofile", { uid: userId }, function(response) {
      console.log("profile", response.data);
      var profile = response.data;
      var returnMessage = "Chào " + "Son" + ". Bạn vừa nói: " + message;
      ZaloClient.api(
        "sendmessage/text",
        "POST",
        { uid: userId, message: returnMessage },
        function(profileResponse) {
          console.log("profileResponse", profileResponse);
        }
      );
    });
  }
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

sendMultipleTextLink = async (uid, links) => {
  var message = {
    links
  };

  console.log("message", message);

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

sendImage = async (uid, message, imageid) => {
  const response = await ZaloClient.api("sendmessage/image", "POST", {
    uid,
    message,
    imageid
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


analyzeQuery = message => {
  const parts = message.split(" ");
  if (parts.length < 1) {
    return {
      type: "EXPERT",
      message
    };
  }
  return {
    type: parts[0],
    message: parts[1]
  };
};

processTinTuc = async (userId, keyword) => {
  console.log("processTinTuc", keyword);
  const result = await getInformation(keyword);
  if (result) {
    console.log("result", result);
    const links = result.data;

    if (links && links.length > 0) {
      sendMultipleTextLink(userId, links.slice(0, 4));
    } else {
      sendTextMessage(userId, "Không có tin tức mới cho mã cổ phiếu này :(");
    }
  }
};

processCoBan = async (userId, keyword) => {
  console.log("processCoBan", keyword);
  const result = await Stock.findStockByCode(keyword);
  if (result) {
    console.log("result", result);
    const data = result;
    if (data.type === 'text') {
      sendTextMessage(userId, data.data);
    } else if (data.type === 'image') {
      sendImage(userId, "", data.attachmentId);
    } else {
      sendTextMessage(userId, "Không có phân tích cơ bản cho mã này :(");
    }
  } else {
      sendTextMessage(userId, "Không có phân tích cơ bản cho mã này :(");
  }
}
