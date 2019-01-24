"use strict";

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserDetailsSchema = new Schema({
  details: {
    first_name: String,
    last_name: String,
    profile_pic: String,
    locale: String,
    timezone: String,
    gender: String,
    id: String,
    subscribe: Boolean,
    receivedDPP: Boolean,
    date_created: Date
  }
});

module.exports = mongoose.model("users", UserDetailsSchema);
