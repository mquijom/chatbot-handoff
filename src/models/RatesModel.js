'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RatesModelSchema = new Schema({
    rates: Number,
    skill: {
        account: {
            id: String,
            name: String
        },
        user: {
            id: String,
            name: String,
            sender: String
        }
    }
});

module.exports = mongoose.model('rates', RatesModelSchema);