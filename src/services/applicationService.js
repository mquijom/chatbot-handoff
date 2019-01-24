var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var messages = [];

exports.processRequest = function (data) {
    var sender = data.sender;
    var method = data.method;
    if (method === "APPLICATION_SAVE") {
        saveApplication(sender);
    }
}

function saveApplication(sender) {
    messages = [];
    messages.push({
        "text": "Great! Your application has been submitted and waiting for approval 👍 👍",
        quick_replies: common.commonQuickReplies()
    });
    utils.sendSeriesMessages(sender, messages);
}