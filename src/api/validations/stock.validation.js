const Joi = require('joi');

module.exports = {
  // GET /v1/stocks
  getStock: {
    query: {
      status: Joi.any().valid(['disabled', 'enabled']),
    },
  },
};
