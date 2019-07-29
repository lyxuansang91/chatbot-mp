/*eslint-disable */

const httpStatus = require("http-status");
const { omit } = require("lodash");
const request = require("request");
const axios = require('axios');
const shortid    = require('shortid');
const path       = require('path')

const multer  = require('multer');
const upload = multer({ 
    storage: multer.diskStorage({
        destination: './uploads/',
        filename: function (req, file, cb){
            // user shortid.generate() alone if no extension is needed
            cb( null, shortid.generate() + path.parse(file.originalname).ext);
        }
    })
}).single('file');


exports.upload = async (req, res) => {
    try {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
              // A Multer error occurred when uploading.
              console.log(error);
              res.json({
                status: false,
                message: error.message
                });
            } else if (err) {
              // An unknown error occurred when uploading.
              console.log(error);
              res.json({
                status: false,
                message: error.message
                });
            }
        
            console.log(req.file)
            res.json({
                success: true,
                data: {
                    file_name: req.file.originalname,
                    file_type: req.file.mimetype,
                    file_size: req.file.size,
                    file_url: process.env.NODE_ENV === 'development' ? req.protocol + '://' + req.get('host') : process.env.BASE_URL
                     + "/" + req.file.path
                }
            });
          })
      } catch (error) {
        res.end(error);
      }
};