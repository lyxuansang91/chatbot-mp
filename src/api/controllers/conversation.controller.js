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

exports.getConversations = async (req, res) => {
  try {
    let { page, limit: perPage, status } = req.query;
    page = page ? Number(page) : 1;
    perPage = perPage ? Number(perPage) : 100;

    const conversations = await ZaloUser.list({
      page,
      perPage,
      status
    });
    const transformedConversations = conversations.map(conversation =>
      conversation
    );

    res.json({ status: "success", data: transformedConversations });
  } catch (error) {
    res.json({ status: "failed", message: error.message });
  }
};