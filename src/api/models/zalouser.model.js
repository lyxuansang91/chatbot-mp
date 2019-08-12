/*eslint-disable */

const mongoose = require('mongoose');


/**
 * User Schema
 * @private
 */
const zaloUserSchema = new mongoose.Schema(
  {
    fromuid: {
      type: String
    },
    phone: {
      type: String
    },
    status: {
      type: String
    },
    appid: {
      type: String
    },
    pageid: {
      type: String
    },
    oaid: {
      type: String
    },
    mac: {
      type: String
    },
    userGender: {
      type: Number
    },
    displayName: {
      type: String
    },
    birthDate: {
      type: Number
    },
    sharedInfo: {
      type: String
    },
    tagsAndNotesInfo: {
      type: Object
    },
    avatar: {
      type: String
    },
    avatars: {
      type: Object
    }
  },
  {
    timestamps: true
  }
);

zaloUserSchema.method({
  transform() {
    const transformed = {};
    const fields = [
      "id",
      "fromuid",
      "displayName",
      "birthDate",
      "avatar",
      "avatars",
      "status",
      "userGender",
      "sharedInfo",
      "tagsAndNotesInfo"
    ];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  }
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

  list({ page = 1, perPage = 100, status }) {
    if (status) {
      return this.find({ status })
        .sort({ createdAt: -1 })
        .skip(perPage * (page - 1))
        .limit(perPage)
        .exec();
    }
    return this.find()
      .sort({ createdAt: -1 })
      .skip(perPage * (page - 1))
      .limit(perPage)
      .exec();
  }
};

/**
 * @typedef ZaloUserSchema
 */
module.exports = mongoose.model('ZaloUser', zaloUserSchema);
