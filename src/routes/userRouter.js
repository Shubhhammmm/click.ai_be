const express=require("express");
const { insertuser, loginuser, test } = require("../controllers/userController");
const Router=express.Router();

Router.post("/register",insertuser)
Router.post("/login",loginuser)
Router.post("/test",test)




module.exports = Router;