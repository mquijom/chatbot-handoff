var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var Client = require('node-rest-client').Client;
var request = require('request');

var messages = [];

exports.exploreHomeLoan = function (sender) {

    messages = [];
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Great! You can apply for a home loan here.",
                // "text": "Great! Can you share with me the house details and your downpayment information?",
                "buttons": [{
                    //     "type": "web_url",
                    //     "url": common.getHomeUrl() + "/homeloan?sender=" + sender,
                    //     "title": "Sure! 🏡👪",
                    //     "webview_height_ratio": "full",
                    //     "messenger_extensions": true
                    // },
                    "type": "web_url",
                    "url": "https://www.unionbankph.com/personal/loans/home-loans/self-assessment-form",
                    "title": "Apply! 🏡👪",
                    "webview_height_ratio": "full",
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

exports.computeMonthlyAmortization = function (sender, price, dp, term) {
    request.get(common.getHousingLoanUrl() + "?term=" + term + "&dp=" + dp + "&price=" + price, {
            headers: {
                "x-ibm-client-id": common.getClientId(),
                "x-ibm-client-secret": common.getClientSecret(),
            }
        },
        function (req, resp) {
            console.log("############ resp: " + JSON.stringify(resp.body));
            var args = JSON.parse(resp.body);

            messages = [];
            messages.push({
                text: "You monthly amortization would be PhP" + common.numberWithCommas(args.amortization.monthly)
            });
            messages.push({
                text: "What would you like to do next?",
                quick_replies: common.commonQuickReplies()
            })

            utils.sendSeriesMessages(sender, messages);
        });
}
