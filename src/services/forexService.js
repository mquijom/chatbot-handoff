
var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var Client = require('node-rest-client').Client;

user_params = [];

// send current dollar exchange rate
exports.sendFOREX = function (sender) {

    var messages = [];

    var client = new Client();
    var args = {
        headers: {"Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    client.get(common.getForexURL(), args, function (data, response) {

        var dollarBuying = "";
        var dollarSelling = "";
        var now = new Date();
        for (var i = 0; i < data.length; i++) {
            if (data[i].symbol === 'USD') {
                dollarBuying = data[i].buying;
                dollarSelling = data[i].selling;
                console.log("As of date: " + data[i].asOf);
                now = new Date(data[i].asOf);
                break;
            }
        }

        
        var today = common.getMonthNames(now.getMonth()) + " " + now.getDate() + ", " + now.getFullYear();
        
        console.log("######## data: " + JSON.stringify(data));
        
        messages.push({"text": "Got it. Let me share our FX Rates."});
        messages.push({"text": "As of " + today + ",  we are buying " + data[i].name + " at an exchange rate of " + data[i].symbol + " 1.00 for PHP " + dollarBuying + " and selling " + data[i].symbol + " 1.00 for PHP " + dollarSelling + "."});
        messages.push({"text": "Would you like to see other currencies’ rates?",
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": "Yes, Please",
                    "payload": "VIEW_ALL_FOREX"
                },
                {
                    "content_type": "text",
                    "title": "No, Thanks",
                    "payload": "RESET"
                }
            ]
        });

        utils.sendSeriesMessages(sender, messages);
    });
};

// send more rates
exports.viewMoreRates = function (sender, sindex) {
    var start_index = parseInt(sindex);
    var client = new Client();
    var args = {
        headers: {"Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    client.get(common.getForexURL(), args, function (data, response) {

        user_params[sender] = [];
        user_params[sender].rates = [];

        var resultlength = data.length;
        console.log("############### data: " + JSON.stringify(data));

        if (start_index >= resultlength) {
            utils.sendTextMessage(sender, 'No more FOREX found.');
            return;
        }

        var end_index = parseInt(start_index) + 4;
        var diff = 0;
        if (end_index > resultlength) {
            diff = end_index - resultlength;
            end_index = resultlength;
        }

        var index = 0;
        if (diff === 3) {
            var title = data[start_index - 1].name + " (" + data[start_index - 1].symbol + ")";
            var sub = "Buying: " + data[start_index - 1].buying + "\n Selling: " + data[start_index - 1].selling;
            var img = common.getHomeUrl() + "/public/flags/" + data[start_index - 1].symbol.substring(0, 2) + ".png";

            user_params[sender].rates.push({
                "title": title,
                "subtitle": sub,
                "image_url": img,
                "buttons": [
                    {
                        "title": "View Details",
                        "type": "postback",
                        "payload": "VIEW_RATES_" + data[start_index - 1].id
                    }
                ]
            });


        }


        for (var i = start_index; i < end_index; i++) {
            var title = data[i].name + " (" + data[i].symbol + ")";
            var sub = "Buying: " + data[i].buying + "\n Selling: " + data[i].selling;
            var img = common.getHomeUrl() + "/public/flags/" + data[i].symbol.substring(0, 2) + ".png";

            user_params[sender].rates.push({
                "title": title,
                "subtitle": sub,
                "image_url": img,
                "buttons": [
                    {
                        "title": "View Details",
                        "type": "postback",
                        "payload": "VIEW_RATES_" + data[i].id
                    }
                ]
            });
        }

        resultlength = user_params[sender].rates.length;
        if (resultlength <= 0) {

        } else if (resultlength === 1) {
            var title = data[start_index - 1].name + " (" + data[start_index - 1].symbol + ")";
            var sub = "Buying: " + data[start_index - 1].buying + "\n Selling: " + data[start_index - 1].selling;
            var img = common.getHomeUrl() + "/public/flags/" + data[start_index - 1].symbol.substring(0, 2) + ".png";

            user_params[sender].rates[index] = {
                "title": title,
                "subtitle": sub,
                "image_url": img,
                "buttons": [
                    {
                        "title": "View Details",
                        "type": "postback",
                        "payload": "VIEW_RATES_" + data[start_index - 1].id
                    }
                ]
            };
        }

        var last = false;
        console.log("end_index" + end_index);
        console.log("data.length" + data.length);
        if (end_index == data.length) {
            last = true;
        }

        var messageData = [];
        if (resultlength < 2) {
            var title = data[start_index].name + " (" + data[start_index].symbol + ")";
            var sub = "Buying: " + data[start_index].buying + "\n Selling: " + data[start_index].selling;
            var img = common.getHomeUrl() + "/public/flags/" + data[start_index].symbol.substring(0, 2) + ".png";
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                                "title": title,
                                "subtitle": sub,
                                "image_url": img
                            }]
                    }
                }
            };
        } else {
            var payload = "VIEW_MORE_RATES_" + end_index;
            if (last) {
                messageData = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "top_element_style": "compact",
                            "elements": user_params[sender].rates
                        }
                    }

                };

            } else {
                messageData = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "top_element_style": "compact",
                            "elements": user_params[sender].rates,
                            "buttons": [
                                {
                                    "title": "View More",
                                    "type": "postback",
                                    "payload": payload
                                }
                            ]
                        }
                    }

                };
            }
        }



        var messages = [];
        if (last) {
            messages.push({text: "Here are the last " + resultlength + " currencies."});
            messages.push(messageData);
            messages.push({text: "Is there anything else I can help you with?",
                "quick_replies": common.commonQuickReplies()});
        } else {
            messages.push({text: "Here are the other available currencies."});
            messages.push(messageData);
            messages.push({text: "Tap View More to see more currencies.",
                "quick_replies": common.commonQuickReplies()});
        }

        utils.sendSeriesMessages(sender, messages);
    });
};

//find rate
exports.findRate = function (sender, rate_id, callback) {
    var user_params = {};
    console.log("RATE_ID: " + rate_id);
    var client = new Client();
    var args = {
        headers: {"Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    client.get(common.getForexURL(), args, function (data, response) {
        user_params.api = "Forex Information";
        user_params.end_point = common.getForexURL();
        console.log('data: ' + JSON.stringify(data));
        var rate = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].id == parseInt(rate_id)) {
                rate = data[i];
                user_params.response = rate;
                break;
            }
        }

        var now = new Date(rate.asOf);
        var today = common.getMonthNames(now.getMonth()) + " " + now.getDate() + ", " + now.getFullYear();
        var messageRate = "As of " + today + ",  we are buying " + rate.name + " at an exchange rate of " + rate.symbol + " 1.00 for PHP " + rate.buying + " and selling " + rate.symbol + " 1.00 for PHP " + rate.selling + ".";

        messageData = {
            "text": messageRate,
            "quick_replies": common.commonQuickReplies()};
        utils.sendMessage(sender, messageData);
        callback(user_params);
    });
};

//find all rates
exports.forexService = function (sender) {
    
    var client = new Client();
    var args = {
        headers: {"Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    var messages = [];
    client.get(common.getForexURL(), args, function (data, response) {
        
        user_params[sender] = [];
        user_params[sender].rates = [];
        var title = "";
        var sub = "";
        var rates = "";
        for (var i = 0; i < data.length; i++) {
            title = data[i].name + " (" + data[i].symbol + ")\n";
            sub = "Buying: Php " + data[i].buying + "\n Selling: Php " + data[i].selling + "\n\n";
            rates = rates + title + sub;
        }

        messages.push({text: rates});
        messages.push({
            "text": "If you wish to have the best deal in buying and selling foreign currencies, you may visit a branch near you.",
            "quick_replies": [
                {
                    "content_type": "text",
                    "title": "Branch Locator",
                    "payload": "BRANCH_LOCATOR"
                },
                {
                    "content_type": "text",
                    "title": "No, Thanks",
                    "payload": "RESET"
                }
            ]
        });

        utils.sendSeriesMessages(sender, messages);

    });
};

exports.forexServiceCard = function (sender) {


    var client = new Client();
    var args = {
        headers: {"Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    client.get(common.getForexURL(), args, function (data, response) {

        console.log("######## data: " + JSON.stringify(data));
        user_params[sender] = [];
        user_params[sender].rates = [];

        var resultlength = data.length;
        if (resultlength > 4) {
            resultlength = 4;
        }

        var messageData = [];
        if (resultlength < 2) {

            var title = data[0].name + " (" + data[0].symbol + ")";
            var sub = "Buying: " + data[0].buying + "\n Selling: " + data[0].selling;
            var img = common.getHomeUrl() + "/public/flags/" + data[0].symbol.substring(0, 2) + ".png";
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                                "title": title,
                                "subtitle": sub,
                                "image_url": img
                            }]
                    }
                }
            };
        } else {
            for (var i = 0; i < resultlength; i++) {
                var title = data[i].name + " (" + data[i].symbol + ")";
                var sub = "Buying: " + data[i].buying + "\n Selling: " + data[i].selling;
                var img = common.getHomeUrl() + "/public/flags/" + data[i].symbol.substring(0, 2) + ".png";
                user_params[sender].rates.push({
                    "title": title,
                    "subtitle": sub,
                    "image_url": img,
                    "buttons": [
                        {
                            "title": "View Details",
                            "type": "postback",
                            "payload": "VIEW_RATES_" + data[i].id
                        }
                    ]
                });
            }

            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
                        "top_element_style": "compact",
                        "elements": user_params[sender].rates,
                        "buttons": [
                            {
                                "title": "View More",
                                "type": "postback",
                                "payload": "VIEW_MORE_RATES_4"
                            }
                        ]
                    }
                },
                "quick_replies": common.commonQuickReplies()
            };

        }

        var messages = [];
        messages.push({text: "Alright. Here it is."});
        messages.push(messageData);
        messages.push({text: "Tap View More to see other available currencies.",
            "quick_replies": common.commonQuickReplies()});
        utils.sendSeriesMessages(sender, messages);

    });
};


