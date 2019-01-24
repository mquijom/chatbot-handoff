var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var messages = [];

exports.activatecardless = function (sender) {
    messages = [];
    messages.push({ "text": "I’ll need to ask for your Account Credentials and a One-Time Password (OTP) to cardless withdrawal and recent transactions." });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Cardless Withdrawal ATM",
                    "subtitle": "",
                    "image_url": common.getHomeUrl() + "/public/debit_card.png",
                    "buttons": [
                        {
                            "type": "web_url",
                            "url": common.getHomeUrl() + "/login-cardless?sender=" + sender,
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