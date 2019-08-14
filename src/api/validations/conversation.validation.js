const Joi = require('joi');

module.exports = {
  // GET /v1/message
  getConversations: {
    query: {
      status: Joi.any().valid(['follow', 'unfollow']),
    },
  },
};
