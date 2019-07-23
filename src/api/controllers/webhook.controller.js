/*eslint-disable */

const httpStatus = require("http-status");
const { omit } = require("lodash");
var ZaloOA = require("zalo-sdk").ZaloOA;
var request = require("request");

const ZaloClient = require("../services/zaloService").ZaloClient;
const ZaloUser = require("../models/zalouser.model");



exports.get = async (req, res) => {
  try {
      console.log('req.body', req.query)
    const event = req.query.event;

    console.log('event', event);

    switch (event) {
      case "follow":
        await handleFollow(req, res);
        break;
      case "unfollow":
        await handleUnfollow(req, res);
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
        fromuid: req.query.fromuid,
        phone: req.query.phone,
        appid: req.query.appid,
        pageid: req.query.pageid,
        oaid: req.query.oaid,
        mac: req.query.mac,
        status: 'follow'
    }

    const checkUser = await ZaloUser.findByZaloUserId(req.query.fromuid)

    if (!checkUser) {
        const user = new ZaloUser(data);
        const savedZaloUser = await user.save();
        res.json({
            status: 'created'
        });
    } else {
        if (checkUser.status !== 'follow') {
            checkUser.status = 'follow';
            await checkUser.save()
        }
        res.json({
            status: 'updated'
        });
    }
  } catch (error) {
    console.log(error);
    res.json(error);
  }
};

handleUnfollow = async (req, res) => {
    try {
        const checkUser = await ZaloUser.findByZaloUserId(req.query.fromuid)
    
        if (checkUser) {
            checkUser.status = 'unfollow';
            await checkUser.save()
            res.json({
                status: 'updated'
            });
        }
      } catch (error) {
        console.log(error);
        res.json(error);
      }
};

handleMessage = async req => {
  console.log(req.body);
  var data = req.query;
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
