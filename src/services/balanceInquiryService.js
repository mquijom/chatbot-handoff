var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var mock_data = require('./mock.js');
var Client = require('node-rest-client').Client;
var request = require('request');
user_params = [];
var messages = [];

function balanceInquiry(sender) {
    messages = [];
    messages.push({
        "text": "I’ll need to ask for your credit card number and a One-Time Password (OTP) to get your balance and recent transactions."
    });
    messages.push({
        "text": "Check your card balance anytime, anywhere with the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal."
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Get Balance & Transactions",
                    "subtitle": "",
                    "image_url": common.getHomeUrl() + "/public/ubpicon.png",
                    "buttons": [{
                            "type": "web_url",
                            "url": common.getHomeUrl() + "/login2?sender=" + sender,
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

function displayCreditCards(sender, data) {
    //var request = require("request");
    //var options = { method: 'GET',
    //url: "https://api-uat.unionbankph.com/ubp/uat/creditcard/v6/REPLACE_CARDNUMBER/CIF",
    //headers:
    //{ "accept": "application/json",
    //"x-ibm-client-secret": common.getClientSecret(),
    //"x-ibm-client-id": common.getClientId() } };

    //request(options, function (error, response, body) {
    //    if (error) return console.error('Failed: %s', error.message);

    //    console.log('Success: ', body);
    // });

    var customer_info = mock_data.cif;
    var cards = mock_data.list_of_cards;


    messages = [];
    messages.push({
        "text": "Thanks for logging in! Here are your credit card details"
    });

    var cards_display = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
            }
        }
    };

    cards_display.attachment.payload.elements = [];
    cards.forEach((card) => {
        var element = {
            "title": "Cashback Platinum MasterCard (x" + cards[0].cards.cardnumber.substring(cards[0].cards.cardnumber.length - 4, cards[0].cards.cardnumber.length) + ")",
            "subtitle": customer_info.sFirstName + " " + customer_info.sLastName,
            "image_url": common.getHomeUrl() + "/public/MC.png",
            "buttons": [{
                    "type": "web_url",
                    "title": "Get Balance",
                    "url": common.getHomeUrl() + "/balance-inq?sender=" + sender,
                    "webview_height_ratio": "full",
                    "messenger_extensions": true
                },
                {
                    "type": "web_url",
                    "title": "Unbilled Transactions",
                    "url": common.getHomeUrl() + "/unbilled-trans?sender=" + sender,
                    "webview_height_ratio": "full",
                    "messenger_extensions": true
                },
                {
                    "type": "web_url",
                    "title": "View Statement",
                    "url": common.getHomeUrl() + "/statement?sender=" + sender,
                    "webview_height_ratio": "full",
                    "messenger_extensions": true
                }
            ]
        };
        cards_display.attachment.payload.elements.push(element);
    })

    messages.push(cards_display);
    utils.sendSeriesMessages(sender, messages);
}

module.exports = {
    balanceInquiry,
    displayCreditCards
}