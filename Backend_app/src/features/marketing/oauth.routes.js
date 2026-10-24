const express = require('express');
const router = express.Router();
const oauthController = require('./oauth.controller');

router.get('/meta/login', oauthController.metaLogin);
router.get('/meta/callback', oauthController.metaCallback);

router.get('/google/login', oauthController.googleLogin);
router.get('/google/callback', oauthController.googleCallback);

module.exports = router;
