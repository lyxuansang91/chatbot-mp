/*eslint-disable */

const mongoose = require('mongoose');
const { omitBy, isNil } = require('lodash');


/**
 * Message Schema
 * @private
 */
const messageSchema = new mongoose.Schema({
  uid: {
    type: String
  },
  zaloMessageId: {
    type: String
  },
  messageType: {
    type: String,
    default: 'text'
  },
  message: {
    type: String,
  },
  status : {
    type: String,
    default: 'pending'
  },
  retry: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
});

messageSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'messageType', 'status', 'retry', 'zaloMessageId', 'uid', 'createdAt', 'updatedAt'];

    fields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },
})

messageSchema.statics = {

  async updateRetry(
    {messageId}
  ) {
    const message = await this.findOne({ _id: messageId }).exec();
    message.retry += 1;
    await message.save()
  },

  list({
    page = 1, perPage = 100, fromuid, status
  }) {
    if (fromuid) {
      if (status) {
        return this.find({fromuid, status})
        .sort({ createdAt: -1 })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();
      } else {
        return this.find({fromuid})
        .sort({ createdAt: -1 })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();
      }
    }

    if (status) {
      return this.find({status})
        .sort({ createdAt: -1 })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();
    }

    return this.find({})
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  listFailed({
    page = 1, perPage = 50,
  }) {
    return this.find({ status: 'failed' })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  listSuccess({
    page = 1, perPage = 50,
  }) {
    return this.find({ status: 'success' })
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },
}

/**
 * @typedef MessageSchema
 */
module.exports = mongoose.model('Message', messageSchema);
