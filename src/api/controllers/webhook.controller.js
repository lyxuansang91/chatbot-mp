/*eslint-disable */

const httpStatus = require('http-status');
const { omit } = require('lodash');
var ZaloOA = require('zalo-sdk').ZaloOA;
var request = require('request');
const axios = require('axios');

const ZaloClient = require('../services/zaloService').ZaloClient;
const ZaloUser = require('../models/zalouser.model');

exports.get = async (req, res) => {
  try {
    console.log('req.body', req.body);
    const event = req.body.event;

    switch (event) {
      case 'follow':
        await handleFollow(req, res);
        break;
      case 'unfollow':
        await handleUnfollow(req, res);
        break;
      case 'sendmsg':
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
    const data = {
      fromuid: req.body.fromuid,
      phone: req.body.phone,
      appid: req.body.appid,
      pageid: req.body.pageid,
      oaid: req.body.oaid,
      mac: req.body.mac,
      status: 'follow',
    };

    const checkUser = await ZaloUser.findByZaloUserId(req.body.fromuid);

    if (!checkUser) {
      const user = new ZaloUser(data);
      const savedZaloUser = await user.save();
      res.json({
        status: 'created',
      });
    } else {
      if (checkUser.status !== 'follow') {
        checkUser.status = 'follow';
        await checkUser.save();
      }
      res.json({
        status: 'updated',
      });
    }
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

handleUnfollow = async (req, res) => {
  try {
    const checkUser = await ZaloUser.findByZaloUserId(req.body.fromuid);

    if (checkUser) {
      checkUser.status = 'unfollow';
      await checkUser.save();
      res.json({
        status: 'updated',
      });
    }
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

handleUserMessage = async (req, res) => {
  const data = req.body;
  const message = data.message;
  const userId = data.fromuid;

  axios
    .get('https://pixabay.com/api/', {
      params: {
        key: '12791370-e3ec2f19769e143cf190f1a8f',
        image_type: 'photo',
        lang: 'en',
        q: message,
      },
    })
    .then(response => {
      const results = response.data;
      if (results && results.hits && results.hits.length > 0) {
        const pickedResult = results.hits[Math.floor(Math.random() * results.hits.length)];
        sendTextLink(
          userId,
          pickedResult.pageURL,
          pickedResult.user,
          pickedResult.tags,
          pickedResult.largeImageURL,
        );
      } else {
        sendTextMessage(userId, 'Sorry, no result!!!');
      }
    })
    .catch(e => {
      console.log(e);
    });
};

handleMessage = async req => {
  console.log(req.body);
  var data = req.body;
  var message = data.message;
  var userId = data.fromuid;
  console.log(data);
  console.log('User', userId, 'had send a message.', message);

  if (userId && message) {
    ZaloClient.api('getprofile', { uid: userId }, function(response) {
      console.log('profile', response.data);
      var profile = response.data;
      var returnMessage = 'Chào ' + 'Son' + '. Bạn vừa nói: ' + message;
      ZaloClient.api('sendmessage/text', 'POST', { uid: userId, message: returnMessage }, function(
        profileResponse,
      ) {
        console.log('profileResponse', profileResponse);
      });
    });
  }
};

sendTextMessage = async (uid, message) => {
  ZaloClient.api('sendmessage/text', 'POST', { uid, message }, function(response) {
    if (response.data && response.data.msgId) {
      const zaloMessageId = response.data.msgId;
      const data = {
        zaloMessageId,
        uid,
        messageType: 'text',
        message,
        status: response.errorMsg === 'Success' ? 'success' : 'failed',
      };
    } else {
      const data = {
        zaloMessageId: null,
        uid,
        messageType: 'text',
        message,
        status: 'failed',
      };
    }
  });
};

sendTextLink = async (uid, link, linktitle, linkdes, linkthumb) => {
  var message = {
    uid,
    links: [
      {
        link,
        linktitle,
        linkdes,
        linkthumb,
      },
    ],
  };
  ZaloClient.api('sendmessage/links', 'POST', { ...message }, function(response) {
    if (response.data && response.data.msgId) {
      const zaloMessageId = response.data.msgId;
      const data = {
        zaloMessageId,
        uid,
        messageType: 'text_link',
        message: JSON.stringify(message),
        status: response.errorMsg === 'Success' ? 'success' : 'failed',
      };
      const msg = new Message(data);
      msg.save();
    } else {
      const data = {
        zaloMessageId: null,
        uid,
        messageType: 'text_link',
        message: JSON.stringify(message),
        status: 'failed',
      };
      const msg = new Message(data);
      msg.save();
    }
  });
};
