/*eslint-disable */

const mongoose = require('mongoose');


/**
 * User Schema
 * @private
 */
const zaloUserSchema = new mongoose.Schema({
  fromuid: {
    type: String
  },
  phone: {
    type: String,
  },
  status : {
    type: String
  },
  appid: {
    type: String,
  },
  pageid: {
    type: String,
  },
  oaid: {
    type: String,
  },
  mac: {
    type: String,
  },
}, {
  timestamps: true,
});


zaloUserSchema.statics = {
  /**
   * Get user
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findByZaloUserId(fromuid) {
    try {
      const user = await this.findOne({ fromuid }).exec();

      if (user) {
        return user;
      }

      return null;
    } catch (error) {
      throw error;
    }
  },

  list({
    page = 1, perPage = 100,
  }) {

    return this.find()
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  },

}

/**
 * @typedef ZaloUserSchema
 */
module.exports = mongoose.model('ZaloUser', zaloUserSchema);
