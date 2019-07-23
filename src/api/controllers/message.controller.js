/*eslint-disable */

const httpStatus = require("http-status");
const { omit } = require("lodash");
var request = require("request");

const ZaloClient = require("../services/zaloService").ZaloClient;
const ZaloUser = require("../models/zalouser.model");
const Message = require("../models/message.model");

exports.send = async (req, res) => {
  try {
    const type = req.body.type;

    const { uid, message, link, linktitle, linkdes, linkthumb  } = req.body

    if (!uid) {
      const users = await ZaloUser.list()

      users.forEach(user => {
        const uid = user.uid;
        switch(type) {
          case 'text':  
            sendTextMessage(uid, message);
          break;
          case 'text_link':
            sendTextLink(uid, link, linktitle, linkdes, linkthumb)
          break;
        }
      });
    } else {
      switch(type) {
        case 'text':  
          sendTextMessage(uid, message);
        break;
        case 'text_link':
          sendTextLink(uid, link, linktitle, linkdes, linkthumb)
        break;
      }
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


uploadMedia = async () => {
  var fileUrl =
    "https://upload.wikimedia.org/wikipedia/commons/a/a3/June_odd-eyed-cat.jpg";
  ZaloClient.api("upload/image", "POST", { file: fileUrl }, function(response) {
    console.log(response);
  });
};

sendTextMessage = async (uid, message) => {
  ZaloClient.api("sendmessage/text", "POST", { uid, message }, function(
    response
  ) {
    const zaloMessageId = response.data.msgId
    const data = {
      zaloMessageId,
      uid,
      messageType: 'text',
      message,
      status: response.errorMsg === 'Success' ? 'success' : 'failed'
    }
    const msg = new Message(data);
    msg.save()
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
  }
  ZaloClient.api("sendmessage/links", "POST", { uid, ...message }, function(response) {
    console.log(response);

    const zaloMessageId = response.data.msgId
    const data = {
      zaloMessageId,
      uid,
      messageType: 'text_link',
      message: JSON.stringify(message),
      status: response.errorMsg === 'Success' ? 'success' : 'failed'
    }
    const msg = new Message(data);
    msg.save()
  });
};

sendInteractiveMessage = async (uid) => {
  var params = {
    uid: uid,
    actionlist: [{
      action: 'oa.open.inapp',
      title: 'Send interactive messages',
      description: 'This is a test for API send interactive messages',
      thumb: 'https://developers.zalo.me/web/static/prodution/images/bg.jpg',
      href: 'https://developers.zalo.me',
      data: 'https://developers.zalo.me',
      popup: {
        title: 'Open Website Zalo For Developers',
        desc: 'Click ok to visit Zalo For Developers and read more Document',
        ok: 'ok',
        cancel: 'cancel'
      }
    }]
  }
  ZaloClient.api('sendmessage/actionlist', 'POST', params, function(response) {
    console.log(response);
  })
}
