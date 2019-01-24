'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CryptoJS = require("crypto-js");
var common = require('../utils/constants.js');

var jwt_secret_token = 'v3r1fY_b@cK-0fFic3-@cc0unT';


var BlockCardSchema = new Schema({
    details: {},
    card_masked: String,
    skill: String,
    encrypted_details: String
});

BlockCardSchema.pre('save', function (next) {
    // this.details.data.forEach((dt) => {
    //     request({
    //         url: 'https://graph.facebook.com/v2.6/' + logs.user + '?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=' + common.getToken(),
    //         method: 'GET',
    //     }, function (error, response, body) {
    //     });
    // });
    this.encrypted_details = encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify(this.details), jwt_secret_token));
    this.card_masked = "XXXX-XXXX-XXXX-" + this.details.card_number.substring(this.details.card_number.length - 4, this.details.card_number.length);
    this.details = {};
    next();
});

BlockCardSchema.post('find', function (result) {
    result.forEach(data => {
        data.details = JSON.parse(CryptoJS.AES.decrypt(decodeURIComponent(data.encrypted_details), jwt_secret_token).toString(CryptoJS.enc.Utf8));
    });
});

module.exports = mongoose.model('block_card_numbers', BlockCardSchema);