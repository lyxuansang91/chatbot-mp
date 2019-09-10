/*eslint-disable */

const mongoose = require('mongoose');
const { omitBy, isNil } = require('lodash');


/**
 * PendingMessage Schema
 * @private
 */
const messageSchema = new mongoose.Schema(
  {
    recipients: {
      type: [String],
      default: null
    },
    messageType: {
      type: String,
      default: "text"
    },
    message: {
      type: [String]
    },
    status: {
      type: String,
      default: "pending"
    }
  },
  {
    timestamps: true
  }
);

messageSchema.method({
  transform() {
    const transformed = {};
    const fields = ['id', 'messageType', 'message', 'status', 'createdAt', 'updatedAt'];

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

  countMessages({
    uid, status
  }) {
    if (uid) {
      if (status) {
        return this.count({ uid, status })
          .exec();
      } else {
        return this.count({ uid })
          .exec();
      }
    }

    if (status) {
      return this.count({ status })
        .exec();
    }

    return this.count({})
      .exec();
  },

  list({
    page = 1, perPage = 100, uid, status
  }) {
    if (uid) {
      if (status) {
        return this.find({ uid, status })
          .sort({ createdAt: -1 })
          .skip(perPage * (page - 1))
          .limit(perPage)
          .exec();
      } else {
        return this.find({ uid })
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
 * @typedef PendingMessageSchema
 */
module.exports = mongoose.model('PendingMessage', messageSchema);
