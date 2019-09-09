/*eslint-disable */

const httpStatus = require('http-status');
const { omit } = require('lodash');
var request = require('request');
const axios = require('axios');
const shortid = require('shortid');
const path = require('path');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');

const ZaloClient = require('../services/zaloService').ZaloClient;
const ZaloUser = require('../models/zalouser.model');
const Message = require('../models/message.model');

exports.getConversations = async (req, res) => {
  try {
    let { page, limit: perPage, status } = req.query;
    page = page ? Number(page) : 1;
    perPage = perPage ? Number(perPage) : 100;

    const countConversations = await ZaloUser.countZaloUsers({ status });

    const conversations = await ZaloUser.list({
      page,
      perPage,
      status,
    });
    const transformedConversations = conversations.map(conversation => conversation.transform());

    res.json({
      status: 'success',
      data: transformedConversations,
      page: page,
      totalPages: Math.ceil(countConversations / perPage),
    });
  } catch (error) {
    res.json({ status: 'failed', message: error.message });
  }
};

exports.getConversationDetail = async (req, res) => {
  try {
    const conversation = await ZaloUser.findByZaloUserId(req.params.id);

    if (conversation) {
      const transformedConversation = conversation.transform();
      res.json({ status: 'success', data: transformedConversation });
    } else {
      res.json({ status: 'success', data: null });
    }
  } catch (error) {
    res.json({ status: 'failed', message: error.message });
  }
};
