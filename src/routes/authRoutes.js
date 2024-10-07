const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/google', authController.googleLogin);

router.get('/google/callback', authController.googleCallback);

router.get('/logout', authController.logout);

router.get('/session', authController.getSession);

module.exports = router;
