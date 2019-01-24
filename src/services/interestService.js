
var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var Client = require('node-rest-client').Client;
var request = require('request');
var async = require('async');

var messages = [];

exports.interestRateCard = function (sender) {
    messages = [];
    messages.push({
        text: "Which type of account are you interested in? 🤔",
        quick_replies: [
            {
                "content_type": "text",
                "title": "Savings Accounts 💰",
                "payload": "INTREST_RATE_SAVINGS"
            },
            {
                "content_type": "text",
                "title": "Checking Accounts💳",
                "payload": "INTEREST_RATE_CHECKING"
            }
        ]
    });
    utils.sendSeriesMessages(sender, messages);
};


exports.interestRateList = function (sender) {
    var account_types = [{ code: "SAREG", currency: "PHP" },
    { code: "CAUSD", currency: "USD" },
    { code: "CARET", currency: "PHP" },
    { code: "CAPWR", currency: "PHP" }];

    messages = [];

    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "list",
                "top_element_style": "compact",
                "elements": [
                    {
                        "title": "Regular Savings Account",
                        "image_url": "https://www.unionbankph.com/images/articles/depositaccounts/headers/header-savings2.jpg",
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Check Rates",
                                "payload": "CHECK_RATES_REGULAR_SAVINGS"
                            }
                        ]
                    },
                    {
                        "title": "Dollar Access Account",
                        "image_url": "https://www.unionbankph.com/images/articles/depositaccounts/headers/header-savings2.jpg",
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Check Rates",
                                "payload": "CHECK_RATES_DOLLAR_ACCESS"
                            }
                        ]
                    },
                    {
                        "title": "Regular Checking Account",
                        "image_url": "https://www.unionbankph.com/images/articles/depositaccounts/headers/header-savings2.jpg",
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Check Rates",
                                "payload": "CHECK_RATES_CHECKING_SAVINGS"
                            }
                        ]
                    },
                    {
                        "title": "Dollar Access Account",
                        "image_url": "https://www.unionbankph.com/images/articles/depositaccounts/headers/header-savings2.jpg",
                        "buttons": [
                            {
                                "type": "postback",
                                "title": "Check Rates",
                                "payload": "CHECK_RATES_POWER_CHECKING"
                            }
                        ]
                    }
                ]
            }
        },
        "quick_replies": common.commonQuickReplies()
    });

    utils.sendSeriesMessages(sender, messages);
};

exports.interestRateSavingsCard = function (sender) {
    messages = [];
    messages.push(
        {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": "Regular Savings Account",
                            "subtitle": "Open a UnionBank Regular Savings Account for transactions anytime, anywhere.",
                            "image_url": "https://www.unionbankph.com/images/articles/depositaccounts/headers/header-savings2.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Check Rates",
                                "payload": "CHECK_RATES_REGULAR_SAVINGS"
                            },
                            {
                                "title": "Open Account",
                                "type": "web_url",
                                "url": "https://www.unionbankph.com/account-opening"
                            }
                            ]
                        },
                        {
                            "title": "Power Checking Account",
                            "subtitle": "Get easier access to your dollar funds with a UnionBank Dollar Access Account.",
                            "image_url": "https://www.unionbankph.com/images/articles/depositaccounts/headers/header-savings2.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Check Rates",
                                "payload": "CHECK_RATES_DOLLAR_ACCESS"
                            },
                            {
                                "title": "Open Account",
                                "type": "web_url",
                                "url": "https://www.unionbankph.com/account-opening"
                            }
                            ]
                        },
                    ]
                }
            }
        });
    messages.push({
        text: "Open your Unionbank Savings Account now!",
        quick_replies: common.commonQuickReplies()
    });

    utils.sendSeriesMessages(sender, messages);
};

exports.interestRateCheckingCard = function (sender) {
    messages = [];
    messages.push(
        {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [
                        {
                            "title": "Regular Checking Account",
                            "subtitle": "Manage your daily check payments easily. With the advantages of UnionBank Online Banking, balancing your checkbook is a breeze!",
                            "image_url": "https://www.unionbankph.com/images/articles/depositaccounts/headers/header-checking2.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Check Rates",
                                "payload": "CHECK_RATES_CHECKING_SAVINGS"
                            },
                            {
                                "title": "Open Account",
                                "type": "web_url",
                                "url": "https://www.unionbankph.com/account-opening"
                            }
                            ]
                        },
                        {
                            "title": "Power Checking Account",
                            "subtitle": "Get easier access to your dollar funds with a UnionBank Dollar Access Account.",
                            "image_url": "https://www.unionbankph.com/images/articles/depositaccounts/headers/header-checking2.jpg",
                            "buttons": [{
                                "type": "postback",
                                "title": "Check Rates",
                                "payload": "CHECK_RATES_POWER_CHECKING"
                            },
                            {
                                "title": "Open Account",
                                "type": "web_url",
                                "url": "https://www.unionbankph.com/account-opening"
                            }
                            ]
                        },
                    ]
                }
            }
        });
    messages.push({
        text: "Open your Unionbank Checking Account now!",
        quick_replies: common.commonQuickReplies()
    });

    utils.sendSeriesMessages(sender, messages);
};


exports.getInterestRates = function (sender, code, currency) {

    var url = "https://api-uat.unionbankph.com/ubp/uat/interest/rates/" + code + "/currencies/" + currency
    request.get(url,
        {
            headers: {
                "x-ibm-client-id": common.getClientId(),
                "x-ibm-client-secret": common.getClientSecret(),
            }
        }, function (req, resp) {
            var args = JSON.parse(resp.body);
            console.log("################ response: " + JSON.stringify(args.rates));
            messages = [];
            args.rates.forEach(function (rate) {
                messages.push({
                    text: "Begin Amount: " + rate.currency + " " + common.numberWithCommas(rate.beginAmount) + "\n"
                    + "End Amount: " + rate.currency + " " + common.numberWithCommas(rate.endAmount) + "\n"
                    + "Interest Rate: " + rate.interestRate
                });
            }, this);
            messages.push({
                text: "Is there anything else I can help you with?",
                quick_replies: common.commonQuickReplies()
            });
            utils.sendSeriesMessages(sender, messages);
        });

};