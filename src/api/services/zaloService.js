/*eslint-disable */
var ZaloOA = require("zalo-sdk").ZaloOA;

var oaid = process.env.ZALO_OAID;
var secretKey = process.env.ZALO_SECRET_KEY;

var zaConfig = {
  oaid: oaid,
  secretkey: secretKey
};

const ZaloClient = new ZaloOA(zaConfig);

exports.ZaloClient = ZaloClient;