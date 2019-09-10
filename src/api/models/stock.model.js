/*eslint-disable */

const mongoose = require("mongoose");

/**
* Stock Statuses
*/
const StockStatuses = ['enabled', 'disabled'];

/**
* Stock Types
*/
const StockTypes = ['text', 'image'];

/**
 * Stock Schema
 * @private
 */
const stockSchema = new mongoose.Schema(
  {
    code: {
      type: String,
    },
    type: {
      type: String,
      default: "text"
    },
    data: {
      type: String
    },
    status: {
      type: String,
      enum: StockStatuses,
      default: "enabled"
    }
  },
  {
    timestamps: true
  }
);

stockSchema.method({
  transform() {
    const transformed = {};
    const fields = ["id", "code", "type", "data", "status"];

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  }
});

stockSchema.statics = {
  countStock({ status }) {
    if (status) {
      return this.count({ status }).exec();
    }

    return this.count({}).exec();
  },

  list({ page = 1, perPage = 100, status }) {
    if (status) {
      return this.find({ status })
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
  }
};

/**
 * @typedef StockSchema
 */
module.exports = mongoose.model("Stock", stockSchema);
