var request = require("request");
var express = require("express");
var path = require("path");
var fb_setup = express.Router();
var utils = require('../utils/utils.js')

fb_setup.route("/")
.get((req, res)=>{
    utils.sendGetStarted();
    utils.sendPersistentMenu();
    utils.sendWhitelist();
    res.sendStatus(200);
})

fb_setup.route("/getStarted")
.get((req, res)=>{
    res.send(utils.sendGetStarted());
})

fb_setup.route("/menu")
.get((req, res)=>{
    res.send(utils.sendPersistentMenu());
})

fb_setup.route("/domain")
.get((req, res)=>{
    res.send(utils.sendWhitelist());
})

module.exports = fb_setup
