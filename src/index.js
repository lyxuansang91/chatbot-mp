// make bluebird default Promise
Promise = require('bluebird'); // eslint-disable-line no-global-assign
const { port, env } = require('./config/vars');
const logger = require('./config/logger');
const app = require('./config/express');
const mongoose = require('./config/mongoose');
const cron = require('node-cron');

// open mongoose connection
mongoose.connect();

// listen to requests
app.listen(port, () => {
    logger.info(`server started on port ${port} (${env})`);

    cron.schedule('0 0 0 * * *', () => {
        console.log('running update every day at 12:00 AM');
    });
});

/**
* Exports express
* @public
*/
module.exports = app;
