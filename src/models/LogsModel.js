'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var LogsModelSchema = new Schema({
    details: {
        id: String,
        logtime: Date,
        user: String,
        module: String,
        action: String,
        skill: {
            name: String,
            mode: String
        },
        params: []
    }
});

module.exports = mongoose.model('logs', LogsModelSchema);