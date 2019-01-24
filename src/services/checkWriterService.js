var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');


exports.checkStatus = function(sender) {
    var messages = [];
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Okay, let's start. Get your Checkwriter details ready.",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": common.getHomeUrl() + "/checkwriter?sender=" + sender,
                        "title": "Proceed",
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