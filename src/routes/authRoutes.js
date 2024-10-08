const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const router = express.Router();

router.get('/google', authController.googleLogin);

router.get('/google/callback', authController.googleCallback);

router.get('/logout', authController.logout);

router.get('/session', authController.getSession);

router.post('/user/login', authController.userLogin)

router.post('/user/register', authController.userRegister)

module.exports = router;
