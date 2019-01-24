var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var Client = require('node-rest-client').Client;
var request = require('request');
user_params = [];
var messages = [];

exports.openAnAccount = function (sender) {
    messages = [];
    messages.push({text: "Got it. Opening an account is easy."});
    messages.push({"attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Just bring with you a valid government-issued ID to the nearest UnionBank branch. And then look for the new accounts section where our team is excited to assist you.",
                "buttons": [
                    {
                        "title": "Show Account Types",
                        "type": "postback",
                        "payload": "SHOW_ACCOUNT_TYPES"
                    },                    
                    {
                        "type": "web_url",
                        "url": common.getHomeUrl() +"/acceptable-ids",
                        "title": "Show acceptable IDs",
                        "webview_height_ratio": "tall",
                        "messenger_extensions": true
                    }
                ]
            }
        },
        quick_replies: [
            {
                "content_type": "text",
                "title": "Find a Branch",
                "payload": "BRANCH_LOCATOR"
            },
            {
                "content_type": "text",
                "title": "Not Now",
                "payload": "RESET"
            }
            
        ]
    });
    utils.sendSeriesMessages(sender, messages);
};

exports.showAccountTypes = function (sender) {
    messages = [];
    messages.push({text: "Here are three types of accounts we have."});
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                        "title": "Savings Account",
                        "subtitle": "A Savings account earns interests, keeps your money safe and gives you quick access to it in case of an emergency.",
                        "image_url":common.getHomeUrl() + "/public/accounts/savings-account2.jpg",
                        "buttons": [{                 
                                "title": "Tell me more",
                                "type": "web_url",
                                "url": "https://www.unionbankph.com/personal/deposit-accounts/savings-accounts"
                            }
                        ]
                    },
                    {
                        "title": "Checking Account",
                        "subtitle": "A Checking account, similar to a Savings account, it also enables you to write checks for purchases or bill payments.",
                        "image_url": common.getHomeUrl() + "/public/accounts/checking-account.jpg",
                        "buttons": [{
                                 "title": "Tell me more",
                                "type": "web_url",
                                "url": "https://www.unionbankph.com/personal/deposit-accounts/checking-accounts"
                            }
                        ]
                    },
                    {
                        "title": "Time Deposit",
                        "subtitle": "A Time Deposit account allows you to invest your money at a higher interest rate for an agreed period of time.",
                        "image_url": common.getHomeUrl() + "/public/accounts/timdeposits-account.jpg",
                        "buttons": [{
                                 "title": "Tell me more",
                                "type": "web_url",
                                "url": "https://www.unionbankph.com/personal/deposit-accounts/time-deposits"
                            }
                        ]
                    }
                ]
            }
        },
        quick_replies: [
            {
                "content_type": "text",
                "title": "Find a Branch",
                "payload": "BRANCH_LOCATOR"
            },
            {
                "content_type": "text",
                "title": "Not Now",
                "payload": "RESET"
            }
            
        ]
    });
    utils.sendSeriesMessages(sender, messages);
};
