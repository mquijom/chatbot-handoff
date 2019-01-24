var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var request = require('request');
user_params = [];
var messages = [];

exports.sendPayBills = function (sender) {
    messages = [];
    // messages.push({"text":"Great! But first, you must login your account to view all your balance and transactions or you may enter your credit card but only some of your balance and transactions can be displayed."});
    messages.push({ "text": "Sure. Have your bill details ready." });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Pay Bills",
                    "subtitle": "",
                    "image_url": common.getHomeUrl() + "/public/billspay_logo.png",
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": common.getHomeUrl() + "/billers?sender=" + sender,
                            "title": "🔒 Proceed",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true
                        },
                        {
                            "title": "Not Now",
                            "type": "postback",
                            "payload": "RESET"
                        }
                    ]
                }]
            }
        }
    });
    utils.sendSeriesMessages(sender, messages);
}

exports.processRequest = function (data) {
    var sender = data.sender;
    var method = data.method;
    console.log('test1');
    if (method === "PAY_BILLS_SUCCESS") {
        messages = [];
        messages.push({
            "text": "Great! You have successfully paid your bills 👍 👍",
            quick_replies: common.commonQuickReplies()
        });
        utils.sendSeriesMessages(sender, messages);
    }
}
