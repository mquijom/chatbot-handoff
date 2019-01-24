var request = require('request');

var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var atmService = require('../services/atmService.js');
var branchService = require('../services/branchService.js');
var forexService = require('../services/forexService.js');
var creditCardServices = require('../services/creditCardService.js');
var autoloanService = require('../services/autoLoanService.js');
var homeLoanService = require('../services/homeLoanService.js');

// var ChatbotReponse = require('../models/ChatbotResponseModel.js');
var Client = require('node-rest-client').Client;
var balanceInquiryService = require('../services/balanceInquiryService.js');
var accountBalances = require('../services/accountBalances.js');
var cardActivation = require('../services/cardActivation.js');
var gsisActivation = require('../services/gsisActivation.js');
var payBills = require('../services/payBillsService.js');
var checkWriterService = require('../services/checkWriterService.js');
var updateContactsService = require('../services/updateContactsService.js');
var async = require('async');
var msg_session = {};
var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

exports.processRequest = function (sender, text, params, callback) {
    var keyword = text.toUpperCase();
    if (!msg_session[sender] || !msg_session[sender].sessionId) {
        msg_session[sender] = {};
        msg_session[sender].sessionId = sender;
    }
    console.log("######### waiting for AI response..." + keyword);
    utils.typing(sender);
    request.post({
        url: common.getDialogflowUrl(),
        headers: {
            Authorization: 'Bearer ' + common.getDialogflowToken()
        },
        json: {
            lang: "en",
            query: keyword,
            sessionId: msg_session[sender].sessionId
        }
    }, function (err, httpResponse, body) {
        console.log("######### AI response: " + JSON.stringify(body));
        if (err) {
            console.log("######### AI response: (ERROR)" + err);
            callback(params);
            return;
        }
        var data = {};
        try {
            data = JSON.parse(body);
        } catch (error) {
            data = body;
        }

        msg_session[sender].sessionId = data.sessionId;
        var messages = [];
        var parameters = data.result.parameters;
        console.log(parameters.location);
        console.log(parameters.location != undefined ? parameters.location != "" : true);
        if (parameters.keyword && parameters.keyword != "" &&
            (parameters.location != undefined ? parameters.location != "" : true)) {
            var intent = parameters.keyword;
            console.log('##################### intent: ' + intent);
            if (intent === "BALANCE_INQUIRY") {
                balanceInquiryService.balanceInquiry(sender);
                reset_convo(sender);
                // } else if (intent === "ACCOUNT_BALANCES") {
                //     accountBalances.getBalances(sender);
                //     reset_convo(sender);
            } else if (intent === "CARD_ACTIVATION") {
                cardActivation.activateCard(sender);
                reset_convo(sender);
                // } else if (intent === "GSIS_ACTIVATION") {
                //     gsisActivation.activateGSIS(sender);
                //     reset_convo(sender);
            } else if (intent === "CHECK_WRITER") {
                checkWriterService.checkStatus(sender);
                reset_convo(sender);
                // } else if (intent === 'UPDATE_CONTACT') {
                //     updateContactsService.updateContacts(sender);
                //     reset_convo(sender);
                // } else if (intent === 'PAY_BILLS') {
                //     payBills.sendPayBills(sender);
                //     reset_convo(sender);
            } else if (intent === 'CC_APPLICATION_STATUS') {
                creditCardServices.creditCardApplicationStatus(sender);
                reset_convo(sender);
            } else if (intent === "ATM_LOCATOR") {
                findATM(parameters.location, sender, resp => {
                    console.log(JSON.stringify(resp));
                    reset_convo(sender);
                });
            } else if (intent === "BRANCH_LOCATOR") {
                findBranch(parameters.location, sender, resp => {
                    console.log(JSON.stringify(resp));
                    reset_convo(sender);
                });
            } else if (intent === "FOREX_RATE") {
                forexService.sendFOREX(sender);
                reset_convo(sender);
            } else if (intent === "FIND_CC") {
                creditCardServices.findACreditCard(sender);
                reset_convo(sender);
            } else if (intent === "EXPLORE_AUTO_LOAN") {
                autoloanService.exploreAutoLoan(sender);
                reset_convo(sender);
            } else if (intent === "EXPLORE_HOME_LOAN") {
                homeLoanService.exploreHomeLoan(sender);
                reset_convo(sender);
            } else if (intent === "LIST_CREDIT_CARD_TRAVEL") {
                creditCardServices.listCreditCardTravel(sender);
                reset_convo(sender);
            } else if (intent === "LIST_CREDIT_CARD_CASHBACK") {
                creditCardServices.listCreditCardCashback(sender);
                reset_convo(sender);
            } else if (intent === "LIST_CREDIT_CARD_REWARDS") {
                creditCardServices.listCreditCardRewards(sender);
                reset_convo(sender);

            } else if (intent === 'BRANCH_SEND_LOCATION') {
                params = {};
                params.mode = 'SEARCH_BRANCH';
                params.action = "ASK_FOR_NEAREST_BRANCH";
                branchService.search(sender);
                reset_convo(sender);

            } else if (intent === 'ATM_SEND_LOCATION') {
                params = {};
                params.mode = 'SEARCH_ATM';
                params.action = "ASK_FOR_NEAREST_ATM";
                atmService.search(sender);
                reset_convo(sender);

            } else if (intent === 'DATE_TIME_TODAY') {
                var date = new Date();
                console.log('Today: ' + date.toLocaleString('en-US'));
                messages.push({
                    text: "The date and time today is " + months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " " + date.toLocaleString('en-US', {
                        timeZone: "Asia/Manila",
                        hour: 'numeric',
                        minute: 'numeric',
                        hour12: true
                    }),
                    quick_replies: common.commonQuickReplies()
                });
                utils.sendSeriesMessages(sender, messages);
            } else if (data.result.fulfillment && data.result.fulfillment.messages &&
                data.result.fulfillment.messages.length > 0 && data.result.fulfillment.messages[0].speech != "") {
                messages.push({
                    text: data.result.fulfillment.messages[0].speech
                });
                utils.sendSeriesMessages(sender, messages);
            } else {
                messages.push({
                    text: "Hmmm.. Sorry I didn't quite get that.🤦‍♂️ Can you be more specific on your inquiry?😕 Or you can just select a category below so I can understand you better.🙏",
                    quick_replies: common.commonQuickReplies()
                });
                utils.sendSeriesMessages(sender, messages);
            }
        } else if (data.result.fulfillment && data.result.fulfillment.messages &&
            data.result.fulfillment.messages.length > 0 && data.result.fulfillment.messages[0].speech != "") {
            messages.push({
                text: data.result.fulfillment.messages[0].speech
            });
            utils.sendSeriesMessages(sender, messages);
        } else {
            messages.push({
                text: "Hmmm.. Sorry I didn't quite get that.🤦‍♂️ Can you be more specific on your inquiry?😕 Or you can just select a category below so I can understand you better.🙏",
                quick_replies: common.commonQuickReplies()
            });
            utils.sendSeriesMessages(sender, messages);
        }
        callback(params);
    });
};

function reset_convo(user_sender) {
    request.delete({
        url: common.getDialogflowContextUrl() + '?sessionId=' + msg_session[user_sender].sessionId,
        headers: {
            Authorization: 'Bearer ' + common.getDialogflowToken()
        }
    }, function (err, httpResponse, body) {
        console.log('Reset Context: ' + JSON.stringify(body));
        // callback(null);
    });
}

function findBranch(user_address, sender, callback) {
    console.log('##################### Find branch in ' + user_address);
    var messages = [];
    var params = {};
    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };
    client.get(common.getBranchURL(), args, function (data, response) {
        params.api = "BRANCH LOCATOR";
        params.end_point = common.getBranchURL();
        // params.response = response;
        if (data.httpCode) {
            params.response = data;
            callback(params);
        } else {
            params.distance = [];
            var branch_elements = [];
            for (var i = 0; i < data.length; i++) {
                if (branch_elements.length == 10) {
                    break;
                } else if (data[i].address.toUpperCase().indexOf(user_address.toUpperCase()) != -1) {
                    params.distance.push({
                        "id": data[i].id,
                        "name": data[i].name,
                        "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                        "latitude": data[i].latitude,
                        "longitude": data[i].longitude
                    });
                    branch_elements.push({
                        "title": data[i].name,
                        "subtitle": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                        "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + data[i].latitude + "," + data[i].longitude + "&zoom=15&markers=" + data[i].latitude + "," + data[i].longitude + "&keys=" + common.getGooleAPIKey(),
                        "buttons": [{
                            "type": "postback",
                            "title": "View Info",
                            "payload": "BRANCH_INFO_" + data[i].id
                        }]
                    });
                }
            }

            console.log('There are ' + branch_elements.length + ' matched branch location on our records.');

            if (branch_elements.length != 0) {
                messages.push({
                    text: 'Found them! Here are the ' + branch_elements.length + ' branches found in ' + user_address.toLowerCase()
                });
                messages.push({
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": branch_elements
                        }
                    }
                });
                messages.push({
                    // text: "Please be specific at your preferred location if you can't find the branch that you search for in " + user_address.toLowerCase()
                    // text: "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal"
                    text: "You may also visit our website to know more about our branches: https://www.unionbankph.com/contact-us/branches"
                })
            } else {
                messages.push({
                    text: "Sorry we don't have any branch on your preffered location."
                }),
                messages.push({
                    text: "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal"
                })
            }
            //        messages.push(utils.constructEndGreeting());
            messages.push({
                text: "Let me know how else I can help.",
                quick_replies: common.commonQuickReplies()
            });
            utils.sendSeriesMessages(sender, messages);
            callback(params);
        }
    });
}

function findATM(user_address, sender, callback) {
    console.log('##################### Find atm in ' + user_address);
    var params = {};
    params.distance = [];
    var atmLocations = [];
    var branchLocations = [];
    async.parallel([
        function (callback) {
            var client = new Client();
            var args = {
                headers: {
                    "Content-Type": "application/json",
                    "x-ibm-client-id": common.getClientId(),
                    "x-ibm-client-secret": common.getClientSecret()
                }
            };


            client.get(common.getAtmURL(), args, function (data, response) {
                for (var i = 0; i < data.length; i++) {
                    atmLocations.push({
                        "id": "ATM_INFO_" + data[i].id,
                        "name": data[i].name,
                        "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                        "latitude": data[i].latitude,
                        "longitude": data[i].longitude
                    });
                }
                callback();
            });
        },
        function (callback) {
            var client = new Client();
            var args = {
                headers: {
                    "Content-Type": "application/json",
                    "x-ibm-client-id": common.getClientId(),
                    "x-ibm-client-secret": common.getClientSecret()
                }
            };

            client.get(common.getBranchURL(), args, function (data, response) {

                for (var i = 0; i < data.length; i++) {
                    branchLocations.push({
                        "id": "BRANCH_INFO_" + data[i].id,
                        "name": data[i].name,
                        "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                        "latitude": data[i].latitude,
                        "longitude": data[i].longitude
                    });
                }
                callback();
            });
        }
    ], function (err) {
        params.distance = atmLocations.concat(branchLocations);

        console.log("length: " + params.distance.length);
        var atms_elements = [];
        var dist = params.distance;
        for (var i = 0; i < dist.length; i++) {
            if (atms_elements.length == 10) {
                break;
            } else if (dist[i].address.toUpperCase().indexOf(user_address.toUpperCase()) != -1) {
                atms_elements.push({
                    "title": dist[i].name,
                    "subtitle": dist[i].address.replace(/[&]nbsp[;]/gi, " "),
                    "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + params.distance[0].latitude + "," + params.distance[0].longitude + "&zoom=15&markers=" + dist[i].latitude + "," + dist[i].longitude,
                    "buttons": [{
                        "type": "postback",
                        "title": "View Info",
                        "payload": dist[i].id
                    }]
                });
            }
        }

        console.log('There are ' + atms_elements.length + ' matched atm/branch location on our records.');

        var messages = [];
        if (atms_elements.length != 0) {
            messages.push({
                text: 'Found them! Here are the ' + atms_elements.length + ' ATMs found in ' + user_address.toLowerCase()
            });
            messages.push({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": atms_elements
                    }
                }
            });
            messages.push({
                // text: "Please be specific at your preferred location if you can't find the atm that you search for in " + user_address.toLowerCase()
                // text: "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal"
                text: "You may also visit our website to know more about our branches: https://www.unionbankph.com/contact-us/branches"
            })
        } else {
            messages.push({
                text: "Sorry we don't have any atm or branch on your preffered location."
            }),
            messages.push({
                text: "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal"
            })
        }

        messages.push({
            text: 'Is there anything else I can help you with?',
            quick_replies: common.commonQuickReplies()
        });
        //        messages.push(utils.constructEndGreeting());
        utils.sendSeriesMessages(sender, messages);
        callback(params);
    });
}