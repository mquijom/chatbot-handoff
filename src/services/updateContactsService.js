var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');


exports.updateContacts = function(sender) {
    var messages = [];
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Okay, let's start. Get your Update Contacts ready.",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": "https://apply.unionbankph.com/contact-details/?fbclid=" + sender,
                        "title": "Proceed"
                        
                    },
                    // "url": common.getHomeUrl() + "/updatecontacts?sender=" + sender,
                    // "webview_height_ratio": "full",
                    //     "messenger_extensions": true
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