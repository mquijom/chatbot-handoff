var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var mock_data = require('./mock.js');
var Client = require('node-rest-client').Client;
var request = require('request');
user_params = [];
var messages = [];

function activateGSIS(sender) {
    messages = [];
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Okay, let's start. Get your card details ready.",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": common.getHomeUrl() + "/gsis-activation?sender=" + sender,
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
            }
        }
    });
    utils.sendSeriesMessages(sender, messages);
}

function successActivationRequest(sender){

    messages = [];

    messages.push({text: "I have received your GSIS activation request. It will take some time to process. I will inform you once it is activated."});
    messages.push({"text": "Is there anything else I can help you with?",
        "quick_replies": common.commonQuickReplies()
    });

    utils.sendSeriesMessages(sender, messages);
}

module.exports = {
    activateGSIS,
    successActivationRequest
}
