// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const path = require('path');

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () => {
  logger.info(`server started on port ${port} (${env})`);
});

global.__basedir = path.join('..', __dirname);

/**
 * Exports express
 * @public
 */
module.exports = app;
