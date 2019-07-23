/*eslint-disable */

const mongoose = require('mongoose');


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


messageSchema.statics = {

  async updateRetry(
    {messageId}
  ) {
    const message = await this.findOne({ _id: messageId }).exec();
    message.retry += 1;
    await message.save()
  },

  list({
    page = 1, perPage = 50,
  }) {
    const options = omitBy({ fromuid }, isNil);

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  listFailed({
    page = 1, perPage = 50,
  }) {
    const options = omitBy({ status }, 'failed');

    return this.find(options)
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

  listSuccess({
    page = 1, perPage = 50,
  }) {
    const options = omitBy({ status }, 'success');

    return this.find(options)
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
