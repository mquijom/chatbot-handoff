var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var messages = [];

exports.getBalances = function (sender) {
    messages = [];
    messages.push({ "text": "I’ll need to ask for your Debit Account Credentials and a One-Time Password (OTP) to get your balance and recent transactions." });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Get Balance & Transactions",
                    "subtitle": "",
                    "image_url": common.getHomeUrl() + "/public/debit_card.png",
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": common.getHomeUrl() + "/login-casa?sender=" + sender,
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