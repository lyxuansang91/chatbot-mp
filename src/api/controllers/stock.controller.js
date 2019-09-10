/*eslint-disable */
const httpStatus = require("http-status");
const { omit } = require("lodash");
var request = require("request");
const axios = require("axios");
const shortid = require("shortid");
const path = require("path");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

const ZaloClient = require("../services/zaloService").ZaloClient;
const ZaloUser = require("../models/zalouser.model");
const Message = require("../models/message.model");
const PendingMessage = require("../models/pedingMessage.model");
const Stock = require("../models/stock.model");

const AWS = require("aws-sdk");

// Configure client for use with Spaces
const spacesEndpoint = new AWS.Endpoint(process.env.SPACES_ENDPOINT);
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.SPACES_ACCESS_KEY_ID,
  secretAccessKey: process.env.SPACES_SECRET_ACCESS_KEY
});

exports.create = async (req, res) => {
  try {
    const image = req.file;
    const fields = req.body;

     let { code, type, data } = fields;

     const checkStock = await Stock.findStockByCode(code)
     if (checkStock) {
        res.json({
          status: "failed",
          message: "Mã chứng khoán đã tồn tại"
        });
     }

    console.log("req.fields", req.body);
    console.log("========================");
    console.log("req.files", req.file);
    console.log("========================");

    // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.
    let linkthumb = null;
    if (image) {
      // handle upload file
      const uploadedFileName =
        shortid.generate() + path.parse(image.originalname).ext;

      // Add a file to a Space
      var params = {
        Body: fs.createReadStream(image.path),
        Bucket: "gcapai",
        Key: uploadedFileName,
        ACL: "public-read"
      };

      const s3Res = await s3.putObject(params).promise();
      if (s3Res && s3Res.ETag) {
        linkthumb = process.env.SPACES_BASE_URL + uploadedFileName;
      } else {
        linkthumb = null;
      }

      console.log("linkthumb", linkthumb);
    }

     switch (type) {
       case "text":
         data;
         break;
       case "image":
         data = linkthumb;
         break;
     }

    let stock = new Stock({ code, type, data });
    const result = await stock.save();

    if (result) {
      res.json({
        status: "success",
        message: result.transform()
      });
    } else {
      res.json({
        status: "failed",
        message: "Không thể khởi tạo mã chứng khoán"
      });
    }
  } catch (error) {
    console.log("error", error);
    res.json({
      status: "failed",
      message: error.message
    });
  }
};

exports.list = async (req, res) => {
  try {
    let { page, limit: perPage, status } = req.query;
    page = page ? Number(page) : 1;
    perPage = perPage ? Number(perPage) : 100;

    const stockCount = await Stock.countStock({ status });

    console.log("stockCount", stockCount);

    const stocks = await Stock.list({
      page,
      perPage,
      status
    });
    const transformedStocks = stocks.map(stock => stock.transform());

    res.json({
      status: "success",
      data: transformedStocks,
      page: page,
      totalPages: Math.ceil(stockCount / perPage)
    });
  } catch (error) {
    res.json({
      status: "failed",
      message: error.message
    });
  }
};


exports.delete = async (req, res) => {
    const stockId = req.params.id;

    const checkStock = await Stock.findById(stockId);
    if (!checkStock) {
      res.json({
        status: "failed",
        message: "Mã chứng khoán không tồn tại"
      });
    }

    const result = await checkStock.delete();
    console.log('result', result);

    res.json({
      status: "success",
      message: "Xoá mã chứng khoán thành công"
    });
}

exports.update = async (req, res) => {
  try {
    const image = req.file;
    const fields = req.body;

    const stockId = req.params.id;

    let { code, type, data } = fields;

    const checkStock = await Stock.findById(stockId);
    if (!checkStock) {
      res.json({
        status: "failed",
        message: "Mã chứng khoán không tồn tại"
      });
    }

    console.log("req.fields", req.body);
    console.log("========================");
    console.log("req.files", req.file);
    console.log("========================");

    // form.parse analyzes the incoming stream data, picking apart the different fields and files for you.
    let linkthumb = null;
    if (image) {
      // handle upload file
      const uploadedFileName =
        shortid.generate() + path.parse(image.originalname).ext;

      // Add a file to a Space
      var params = {
        Body: fs.createReadStream(image.path),
        Bucket: "gcapai",
        Key: uploadedFileName,
        ACL: "public-read"
      };

      const s3Res = await s3.putObject(params).promise();
      if (s3Res && s3Res.ETag) {
        linkthumb = process.env.SPACES_BASE_URL + uploadedFileName;
      } else {
        linkthumb = null;
      }

      console.log("linkthumb", linkthumb);
    }

    switch (type) {
      case "text":
        data;
        break;
      case "image":
        data = linkthumb;
        break;
    }

    checkStock.code = code;
    checkStock.type = type;
    checkStock.data = data;
    const result = await checkStock.save();

    if (result) {
      res.json({
        status: "success",
        message: result.transform()
      });
    } else {
      res.json({
        status: "failed",
        message: "Cập nhật tạo mã chứng khoán không thành công"
      });
    }
  } catch (error) {
    console.log("error", error);
    res.json({
      status: "failed",
      message: error.message
    });
  }
};