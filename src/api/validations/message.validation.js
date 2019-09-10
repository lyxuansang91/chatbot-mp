const Joi = require('joi');

module.exports = {
  // GET /v1/message
  getMessage: {
    query: {
      status: Joi.any().valid(['success', 'failed']),
    },
  },
  getPendingMessage: {
    query: {
      status: Joi.any().valid(['pending', 'approved']),
    },
  },
};
