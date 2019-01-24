
var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var Client = require('node-rest-client').Client;
var request = require('request');

user_params = [];

exports.sendLoanMenu = function (sender) {
    var messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                        "title": "Auto Loan",
                        "subtitle": "Set your plans in motion",
                        "image_url": common.getHomeUrl() + "/public/ubp/autoloan.jpg",
                        "buttons": [{
                                "type": "postback",
                                "title": "Loan Calculator",
                                "payload": "AUTO_LOAN_CALCULATOR"
                            },
                            {
                                "type": "postback",
                                "title": "FAQs",
                                "payload": "AUTO_LOAN_FAQS"
                            }
                        ]
                    },
                    {
                        "title": "Home Loan",
                        "subtitle": "Let's build your dream home together",
                        "image_url": common.getHomeUrl() + "/public/ubp/homeloan.jpg",
                        "buttons": [{
                                "type": "postback",
                                "title": "Loan Calculator",
                                "payload": "HOME_LOAN_CALCULATOR"
                            },
                            {
                                "type": "postback",
                                "title": "FAQs",
                                "payload": "HOME_LOAN_FAQS"
                            }
                        ]
                    }
                ]
            }
        }
    };
    var messages = [];
    messages.push(messageData);
//        messages.push({text:"Let me know how else I can help.",
//                    quick_replies:common.commonQuickReplies()});
    utils.sendSeriesMessages(sender, messages);
};

exports.autoLoanStep1 = function (sender) {
    var messages = [];
    messages.push({text: "Ok. Let's get started!"});
    messages.push({text: "Do you know the price of the car you want to avail?",
        quick_replies: [
            {
                "content_type": "text",
                "title": "Yes",
                "payload": "AUTO_LOAN_STEP1_YES"
            },
            {
                "content_type": "text",
                "title": "No",
                "payload": "AUTO_LOAN_STEP1_NO"
            }
        ]});

    utils.sendSeriesMessages(sender, messages);
};

exports.autoLoanStep2Yes = function (sender) {
    var messages = [];
    messages.push({text: "Great!"});
    messages.push({text: "How much is the total price of the car?"});

    utils.sendSeriesMessages(sender, messages);
};

exports.findCarBrands = function (sender) {
    var messages = [];
    utils.sendTextMessage(sender, "Ok. Let me show you the list of cars and their prices.");
    messages.push({text: "Please select a brand"});
    var client = new Client();
//    var args = {headers: {"Content-Type": "application/json"}};

    client.post("https://www.unionbankph.com/components/com_autoloans/ajax/getbrands.php", function (data, response) {

        var brands = JSON.parse(data);
        user_params[sender] = [];
        user_params[sender].brands = [];
        var resultlength = data.length;
        if (resultlength > 4) {
            resultlength = 4;
        }

        var messageData = [];
        if (resultlength < 2) {


        } else {
            for (var i = 0; i < resultlength; i++) {
                console.log("brand: " + brands[i].brand);
                var title = brands[i].brand;
                var img = common.getHomeUrl() + "/public/cars/" + brands[i].brand + ".jpg";
                user_params[sender].brands.push({
                    "title": title,
                    "image_url": img,
                    "buttons": [
                        {
                            "title": "Select",
                            "type": "postback",
                            "payload": "SELECT_BRAND_" + brands[i].brand
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
                        "elements": user_params[sender].brands,
                        "buttons": [
                            {
                                "title": "View More",
                                "type": "postback",
                                "payload": "VIEW_MORE_BRANDS_4"
                            }
                        ]
                    }
                },
//                "quick_replies": common.commonQuickReplies()
            };
        }
        messages.push(messageData);
        utils.sendSeriesMessages(sender, messages);
    });
};
exports.findMoreCarBrands = function (sender, start_index) {
    var client = new Client();
    var args = {
        headers: {"Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };
    client.get("https://www.unionbankph.com/components/com_autoloans/ajax/getbrands.php", args, function (data, response) {

        var data = JSON.parse(data);
        user_params[sender] = [];
        user_params[sender].brands = [];
        var resultlength = data.length;
        if (start_index >= resultlength) {
            utils.sendTextMessage(sender, 'No more brands found.');
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
            var title = data[start_index - 1].brand;
            var img = common.getHomeUrl() + "/public/cars/" + data[start_index - 1].brand + ".jpg";
            user_params[sender].brands.push({
                "title": title,
                "image_url": img,
                "buttons": [
                    {
                        "title": "Select",
                        "type": "postback",
                        "payload": "SELECT_BRAND_" + data[start_index - 1].brand
                    }
                ]
            });
        }


        for (var i = start_index; i < end_index; i++) {
            var title = data[i].brand;
            var img = common.getHomeUrl() + "/public/cars/" + data[i].brand + ".jpg";
            user_params[sender].brands.push({
                "title": title,
                "image_url": img,
                "buttons": [
                    {
                        "title": "Select",
                        "type": "postback",
                        "payload": "SELECT_BRAND_" + data[i].brand
                    }
                ]
            });
        }

        resultlength = user_params[sender].brands.length;
        if (resultlength <= 0) {

        } else if (resultlength === 1) {
            var title = data[start_index - 1].brand;
            user_params[sender].rates[index] = {
                "title": title,
                "buttons": [
                    {
                        "title": "Select",
                        "type": "postback",
                        "payload": "SELECT_BRAND_" + data[start_index - 1].brand
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
//            var title = data[start_index].name + " (" + data[start_index].symbol + ")";
//            var sub = "Buying: " + data[start_index].buying + "\n Selling: " + data[start_index].selling;
//            var img = common.getHomeUrl() + "/public/flags/" + data[start_index].symbol.substring(0, 2) + ".png";
//            messageData = {
//                "attachment": {
//                    "type": "template",
//                    "payload": {
//                        "template_type": "generic",
//                        "elements": [{
//                                "title": title,
//                                "subtitle": sub,
//                                "image_url": img
//                            }]
//                    }
//                }
//            };
        } else {
            var payload = "VIEW_MORE_BRANDS_" + end_index;
            if (last) {
                messageData = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "top_element_style": "compact",
                            "elements": user_params[sender].brands
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
                            "elements": user_params[sender].brands,
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
//        if (last) {
//            messages.push({text: "Here are the last " + resultlength + " currencies."});
//            messages.push(messageData);
//            messages.push({text: "Is there anything else I can help you with?",
//                "quick_replies": common.commonQuickReplies()});
//        } else {
//            messages.push({text: "Here are the other available currencies."});
//            messages.push(messageData);
//            messages.push({text: "Tap View More to see more currencies.",
//                "quick_replies": common.commonQuickReplies()});
//        }
        messages.push(messageData);
        utils.sendSeriesMessages(sender, messages);
    });
};
exports.findCarModel = function (sender, brand_name) {

    console.log("brand_name: " + brand_name);
    var messages = [];
    messages.push({text: "Please select a model"});
    request.post({url: "https://www.unionbankph.com/components/com_autoloans/ajax/getcars.php", form: {brand: brand_name, price: 0.00}}, function (err, httpResponse, body) {
        var brands = JSON.parse(body);
        console.log("model: " + brands);
        user_params[sender] = [];
        user_params[sender].brands = [];
        var resultlength = body.length;
        if (resultlength > 4) {
            resultlength = 4;
        }

        var messageData = [];
        if (resultlength < 2) {


        } else {
            for (var i = 0; i < resultlength; i++) {
                console.log("brand: " + brands[i].brand);
                var title = brands[i].name;
                var sub = "Php " + common.numberWithCommas(brands[i].price);
                user_params[sender].brands.push({
                    "title": title,
                    "subtitle": sub,
                    "buttons": [
                        {
                            "title": "Select",
                            "type": "postback",
                            "payload": "SELECT_MODEL_" + brands[i].price
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
                        "elements": user_params[sender].brands,
                        "buttons": [
                            {
                                "title": "View More",
                                "type": "postback",
                                "payload": "VIEW_MORE_MODELS_4-" + brand_name
                            }
                        ]
                    }
                },
//                "quick_replies": common.commonQuickReplies()
            };
        }
        messages.push(messageData);
        utils.sendSeriesMessages(sender, messages);
    });
//    client.post("https://www.unionbankph.com/components/com_autoloans/ajax/getcars.php",args, function (data, response) {
//        console.log("response: " + response);
//        console.log("model: "+ data); 
//        var brands = JSON.parse(data);
//        console.log("model: "+ brands); 
//        
//        
//        user_params[sender] = [];
//        user_params[sender].data = [];
//
//        var resultlength = data.length;
//        if (resultlength > 4) {
//            resultlength = 4;
//        }
//
//        var messageData = [];
//        if (resultlength < 2) {
//
//            
//        } else {
//            for (var i = 0; i < resultlength; i++) {
//                console.log("brand: " +brands[i].brand);
//                var title = brands[i].brand;
//                user_params[sender].brands.push({
//                    "title": title,
//                    "buttons": [
//                        {
//                            "title": "Select",
//                            "type": "postback",
//                            "payload": "SELECT_BRAND_" + brands[i].brand
//                        }
//                    ]
//                });
//            }
//
//            messageData = {
//                "attachment": {
//                    "type": "template",
//                    "payload": {
//                        "template_type": "list",
//                        "top_element_style": "compact",
//                        "elements": user_params[sender].brands,
//                        "buttons": [
//                            {
//                                "title": "View More",
//                                "type": "postback",
//                                "payload": "VIEW_MORE_BRANDS_4"
//                            }
//                        ]
//                    }
//                },
//                "quick_replies": common.commonQuickReplies()
//            };
//
//        }
//        messages.push(messageData);
//    utils.sendSeriesMessages(sender, messages);
//    });

};
exports.findMoreCarModels = function (sender, start_index, brand_name) {
    console.log("start_index: " + start_index);
    console.log("brand_name: " + brand_name);
    request.post({url: "https://www.unionbankph.com/components/com_autoloans/ajax/getcars.php", form: {brand: brand_name, price: 0.00}}, function (err, httpResponse, body) {

        var data = JSON.parse(body);
        user_params[sender] = [];
        user_params[sender].brands = [];
        var resultlength = data.length;
        if (start_index >= resultlength) {
            utils.sendTextMessage(sender, 'No more brands found.');
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
            var title = data[start_index - 1].name;
            var sub = "Php " + common.numberWithCommas(data[start_index - 1].price);
            user_params[sender].brands.push({
                "title": title,
                "subtitle": sub,
                "buttons": [
                    {
                        "title": "Select",
                        "type": "postback",
                        "payload": "SELECT_MODEL_" + data[start_index - 1].price
                    }
                ]
            });
        }


        for (var i = start_index; i < end_index; i++) {
            var title = data[i].name;
            var sub = "Php " + common.numberWithCommas(data[i].price);
            user_params[sender].brands.push({
                "title": title,
                "subtitle": sub,
                "buttons": [
                    {
                        "title": "Select",
                        "type": "postback",
                        "payload": "SELECT_MODEL_" + data[i].price
                    }
                ]
            });
        }

        resultlength = user_params[sender].brands.length;
        if (resultlength <= 0) {

        } else if (resultlength === 1) {
            var title = data[start_index - 1].name;
            var sub = "Php " + common.numberWithCommas(data[start_index - 1].price);
            user_params[sender].rates[index] = {
                "title": title,
                "subtitle": sub,
                "buttons": [
                    {
                        "title": "Select",
                        "type": "postback",
                        "payload": "SELECT_MODEL_" + data[start_index - 1].price
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
//            var title = data[start_index].name + " (" + data[start_index].symbol + ")";
//            var sub = "Buying: " + data[start_index].buying + "\n Selling: " + data[start_index].selling;
//            var img = common.getHomeUrl() + "/public/flags/" + data[start_index].symbol.substring(0, 2) + ".png";
//            messageData = {
//                "attachment": {
//                    "type": "template",
//                    "payload": {
//                        "template_type": "generic",
//                        "elements": [{
//                                "title": title,
//                                "subtitle": sub,
//                                "image_url": img
//                            }]
//                    }
//                }
//            };
        } else {
            var payload = "VIEW_MORE_MODELS_" + end_index + "-" + brand_name;
            if (last) {
                messageData = {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "top_element_style": "compact",
                            "elements": user_params[sender].brands
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
                            "elements": user_params[sender].brands,
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
//        if (last) {
//            messages.push({text: "Here are the last " + resultlength + " currencies."});
//            messages.push(messageData);
//            messages.push({text: "Is there anything else I can help you with?",
//                "quick_replies": common.commonQuickReplies()});
//        } else {
//            messages.push({text: "Here are the other available currencies."});
//            messages.push(messageData);
//            messages.push({text: "Tap View More to see more currencies.",
//                "quick_replies": common.commonQuickReplies()});
//        }
        messages.push(messageData);
        utils.sendSeriesMessages(sender, messages);
    });
};
exports.sendDownPaymentOption = function (sender, price) {

    console.log("PRICE: " + price);
    var messages = [];
    messages.push({text: "Got it!"});
    var message = {text: "Please select Downpayment Option",
        quick_replies: [{
                "content_type": "text",
                "title": "20%",
                "payload": "AUTO_LOAN_DOWNPAYMENT_20-" + price
            },
            {
                "content_type": "text",
                "title": "30%",
                "payload": "AUTO_LOAN_DOWNPAYMENT_30-" + price
            },
            {
                "content_type": "text",
                "title": "40%",
                "payload": "AUTO_LOAN_DOWNPAYMENT_40-" + price
            },
            {
                "content_type": "text",
                "title": "50%",
                "payload": "AUTO_LOAN_DOWNPAYMENT_50-" + price
            },
            {
                "content_type": "text",
                "title": "60%",
                "payload": "AUTO_LOAN_DOWNPAYMENT_60-" + price
            }]
    };
    messages.push(message);
    utils.sendSeriesMessages(sender, messages);
};

exports.sendTermsOption = function (sender, args) {
    var messages = [];
    messages.push({text: "One last step."});
    var message = {text: "Kindly select your desired loan terms",
        quick_replies: [{
                "content_type": "text",
                "title": "60 months",
                "payload": "AUTO_LOAN_TERMS_60-" + args[0] + "-" + args[1]
            },
            {
                "content_type": "text",
                "title": "48 months",
                "payload": "AUTO_LOAN_TERMS_48-" + args[0] + "-" + args[1]
            },
            {
                "content_type": "text",
                "title": "36 months",
                "payload": "AUTO_LOAN_TERMS_36-" + args[0] + "-" + args[1]
            },
            {
                "content_type": "text",
                "title": "24 months",
                "payload": "AUTO_LOAN_TERMS_24-" + args[0] + "-" + args[1]
            },
            {
                "content_type": "text",
                "title": "12 months",
                "payload": "AUTO_LOAN_TERMS_12-" + args[0] + "-" + args[1]
            }]
    };
    messages.push(message);
    utils.sendSeriesMessages(sender, messages);
};

exports.computeAutoLoan = function (sender, args) {

    utils.sendTextMessage(sender, "Please wait while I compute your loan.");
    var messages = [];

    var car_price = args[2];
    var term = args[0];
    var downpayment = args[1] / 100;
    console.log(args[1] + "% DP: " + downpayment);
    var offset = "0";

    var amount_financed = car_price * downpayment;
    var amortization = 0;
    var loanable_amount = car_price - (amount_financed);
    var std = 0;
    var recommended_income = 0;
    var downpayment_amount = 0;

    switch (parseInt(term))
    {
        case 12:
            std = 6.56;
            break;
        case 18:
            std = 9.19;
            break;
        case 24:
            std = 11.30;
            break;
        case 36:
            std = 16.82;
            break;
        case 48:
            std = 23.20;
            break;
        case 60:
            std = 30.26;
            break;
        default:
            std = 0;
    }

    request.post({
        url: common.getComAutoloanUrl(),
        form: {amount: loanable_amount}},
            function (err, httpResponse, body) {

                var data = JSON.parse(body);
                offset = Number(data[0]);

                amortization = (loanable_amount + (loanable_amount * (std / 100))) / term;
                recommended_income = amortization * 3;
                downpayment_amount = amount_financed + offset;

                messages.push({text: "Ok, Here's your loan details:"});
                messages.push({text: "Car Price \n Php " + common.numberWithCommas(car_price)});
                messages.push({text: "Monthly Income Required \n Php " + common.numberWithCommas(recommended_income)});
                messages.push({text: "Amount Financed \n Php " + common.numberWithCommas(loanable_amount)});
                messages.push({text: "Chattel Mortgage Fees \n Php " + common.numberWithCommas(offset)});
                messages.push({text: "Total Cashout \n Php " + common.numberWithCommas(downpayment_amount)});
                messages.push({text: "Monthly Amortization \n Php " + common.numberWithCommas(amortization)});
                messages.push({text: "Would you like to proceed with the loan application?",
                    quick_replies: [{
                            "content_type": "text",
                            "title": "Yes",
                            "payload": "AUTO_LOAN_APPLICATION_YES"
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

exports.computeCarAutoLoan = function (carPrice, loanTerm, loanDownPayment, offset) {

    var car_price = carPrice;
    var term = loanTerm;
    var downpayment = loanDownPayment / 100;
    console.log(loanDownPayment + "% DP: " + downpayment);

    var amount_financed = car_price * downpayment;
    var amortization = 0;
    var loanable_amount = car_price - (amount_financed);
    var std = 0;
    var recommended_income = 0;
    var downpayment_amount = 0;

    switch (parseInt(term))
    {
        case 12:
            std = 6.56;
            break;
        case 18:
            std = 9.19;
            break;
        case 24:
            std = 11.30;
            break;
        case 36:
            std = 16.82;
            break;
        case 48:
            std = 23.20;
            break;
        case 60:
            std = 30.26;
            break;
        default:
            std = 0;
    }

    console.log("###### Loanable amount: " + loanable_amount);

    amortization = (loanable_amount + (loanable_amount * (std / 100))) / term;
    recommended_income = amortization * 3;
    downpayment_amount = amount_financed + offset;

    return {
        price: car_price,
        monthly_income_required: recommended_income,
        amount_financed: loanable_amount,
        chattel_mortgage_fees: offset,
        total_cashout: downpayment_amount,
        monthly_amortization: amortization
    };

};

exports.getLoanAmount = function (sender) {

    var messages = [];
    messages.push({text: "Found a home you like?"});
    messages.push({text: "Let's start!"});
    messages.push({text: "How much is the total contract price (Php)?"});
    utils.sendSeriesMessages(sender, messages);

};

exports.getLoanTerms = function (sender, args) {

    var messages = [];
    messages.push({text: "Ok. Got it!"});
    messages.push({text: "How long will be the length of the Loan (Years)?"});
    messages.push({text: "Maximum Lenght of Loan is 20 Years"});
    utils.sendSeriesMessages(sender, messages);
};

exports.maxLoanTerms = function (sender, args) {

    var messages = [];
    messages.push({text: "Oops. Your input exceeds the maximum length of loan"});
    messages.push({text: "Please enter again your desired lenght of loan. \n (Maximum Lenght of Loan is 20 Years)"});
    utils.sendSeriesMessages(sender, messages);
};

exports.invalidAmount = function (sender) {

    var messages = [];
    messages.push({text: "Sorry I don't think I got that."});
    messages.push({text: "Please enter the amount again."});
    utils.sendSeriesMessages(sender, messages);
};

exports.getInterestRate = function (sender, amount) {

    var messages = [];
    messages.push({text: "Great!"});
    var message = {text: "Please select your desired Interest Rate",
        quick_replies: [{
                "content_type": "text",
                "title": "5.5% fixed for 1 yr",
                "payload": "HOME_LOAN_RATE_5.5-" + amount
            },
            {
                "content_type": "text",
                "title": "6.5% fixed for 3 yrs",
                "payload": "HOME_LOAN_RATE_6.5-" + amount
            },
            {
                "content_type": "text",
                "title": "7.5% fixed for 5 yrs",
                "payload": "HOME_LOAN_RATE_7.5-" + amount
            },
            {
                "content_type": "text",
                "title": "9.5% fixed for 6-10 yrs",
                "payload": "HOME_LOAN_RATE_9.5-" + amount
            },
            {
                "content_type": "text",
                "title": "10.5% fixed for 11-15 yrs",
                "payload": "HOME_LOAN_RATE_10.5-" + amount
            }]
    };

    messages.push(message);
    utils.sendSeriesMessages(sender, messages);
};

exports.computeHomeLoan = function (sender, args) {

    var payment;
    var str = String(args[0]);
    var a = (str.replace(/,/, ""));
    var t_years = args[2] * 12;
    var t_interest = args[1] / 1200;
    var t = (1.0 / (Math.pow((1 + t_interest), t_years)));

    if (t < 1) {
        payment = eval((a * t_interest) / (1 - t));
    } else {
        payment = eval(a / t_years);
    }

    var total = payment;
    var income = (total / 0.40);


    console.log("TOTAL: " + total);
    console.log("INCOME: " + income);


    var messages = [];
    messages.push({text: "Your estimated Monthly Amortization for " + args[2] + " years at " + args[1] + "% for a Loan Amount of Php " + common.numberWithCommas(a) + " is Php " + common.numberWithCommas(total) + "."});
    messages.push({text: "The minimum required income for this loan would be Php " + common.numberWithCommas(income)});
    messages.push({text: "Would you like to proceed with the loan application?",
        quick_replies: [{
                "content_type": "text",
                "title": "Yes",
                "payload": "HOME_LOAN_APPLICATION_YES"
            },
            {
                "content_type": "text",
                "title": "No, Thanks",
                "payload": "RESET"
            }
        ]
    });
    utils.sendSeriesMessages(sender, messages);
};


exports.sendHomeApplicationForm = function (sender) {

    var messages = [];
    messages.push({text: "I'll be sending you the Home Loan Applcation Form in a while"});
    messages.push({text: "Fill-up the form and send it to homeloans@unionbankph.com"});
    messages.push({attachment: {
            type: "file",
            payload: {
                url: "https://www.unionbankph.com/images/articles/loans/housingloans/forms/Home%20Loan%20Application%20Form%20padded%2002-21-2017.pdf"
            }
        }});
    messages.push({text: "Is there anything else I can help you with?",
        quick_replies: common.commonQuickReplies()
    });


    utils.sendSeriesMessages(sender, messages);
};

exports.sendAutoApplicationForm = function (sender) {

    var messages = [];
    messages.push({text: "I'll be sending you the Autp Loan Applcation Form in a while"});
    messages.push({text: "Fill-up the form and send it to autoloans@unionbankph.com"});
    messages.push({attachment: {
            type: "file",
            payload: {
                url: "https://www.unionbankph.com/images/articles/loans/autoloans/Auto%20Loans%20Application%20for%20Individual%20and%20Sole%20Proprietorship%2002-21-2017.pdf"
            }
        }});
    messages.push({text: "Is there anything else I can help you with?",
        quick_replies: common.commonQuickReplies()
    });


    utils.sendSeriesMessages(sender, messages);
};


exports.askMe = function (sender, type) {

    var messages = [];
    messages.push({text: "Go ahead ask me about " + type + " loans"});
    utils.sendSeriesMessages(sender, messages);

};


exports.getCarBrands = function () {



};


exports.computeCarLoanOptions = function (params, callback) {
    
    
};
