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
const mongoose = require("../../config/mongoose");

// open mongoose connection
mongoose.connect();

const ZaloClient = require("../services/zaloService").ZaloClient;
const ZaloUser = require("../models/zalouser.model");
const Message = require("../models/message.model");

const importCurrentUserProfileFromZalo = async () => {
  try {
    const users = await ZaloUser.list({
      page: 1,
      perPage: 1000
    });

    users.forEach(async user => {
      const zaloProfile = await ZaloClient.api("getprofile", {
        uid: user.fromuid
      });
      console.log("zaloProfile", zaloProfile.data);

      const zaloUser = new ZaloUser({
        ...user,
        ...zaloProfile.data
      });

      const updatedUser = await zaloUser.save();
      if (updatedUser) {
        console.log("Successful to update user", updatedUser);
      } else {
        console.log("Failed to update user", updatedUser);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

importCurrentUserProfileFromZalo();
