/*eslint-disable */

const express = require('express');

const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const webhookRoutes = require('./webhook.route');
const messageRoutes = require('./message.route');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));


/**
 * GET v1/docs
 */
router.use('/docs', express.static('docs'));
router.use('/assets', express.static('assets'));

router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/webhook', webhookRoutes);
router.use('/messages', messageRoutes);

module.exports = router;
