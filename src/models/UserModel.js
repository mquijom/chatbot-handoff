'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserModelSchema = new Schema({
    details: {
        account: {
            number: String,
            name: String
        },
        mobileNumber: String,
        pin: String,
        username: String,
        password: String,
        sender: String
    }
});

module.exports = mongoose.model('userslist', UserModelSchema);