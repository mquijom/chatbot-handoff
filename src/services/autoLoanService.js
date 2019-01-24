var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var Client = require('node-rest-client').Client;
var request = require('request');
var loanService = require('./loanService.js');
var async = require('async');

user_params = [];

var messages = [];

exports.exploreAutoLoan = function (sender) {

    messages = [];
    messages.push({
        text: "Alright! Let's look at Auto Loans. How do you want us to start?",
        quick_replies: [{
            "content_type": "text",
            "title": "I have a car in mind",
            "payload": "CAR_LOAN_STEP1_OPTION1"
        },
        {
            "content_type": "text",
            "title": "Start with my budget",
            "payload": "CAR_LOAN_STEP1_OPTION2"
        },
        // {
        //     "content_type": "text",
        //     "title": "Can I afford it?",
        //     "payload": "CAR_LOAN_STEP1_OPTION3"
        // },
        {
            "content_type": "text",
            "title": "Maybe later",
            "payload": "RESET"
        }]
    });

    utils.sendSeriesMessages(sender, messages);
};

exports.carLoanStep1Option1 = function (sender) {
    messages = [];
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Great! Can you share with me the car details and your downpayment information?",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": common.getHomeUrl() + "/autoloan-car-specific?sender=" + sender,
                        "title": "Sure! 🚗💰",
                        "webview_height_ratio": "full",
                        "messenger_extensions": true
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
};

exports.carLoanStep1Option2 = function (sender) {
    messages = [];
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Sure! Can you share with me your budget and downpayment information?",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": common.getHomeUrl() + "/autoloan-budget-specific?sender=" + sender,
                        "title": "Ok! 💰🙂",
                        "webview_height_ratio": "full",
                        "messenger_extensions": true
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
};

exports.carLoanStep1Option3 = function (sender) {
    messages = [];
    messages.push({ text: "Let's check how much you can afford." });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Can you share with me your monthly income, downpayment and loan information?",
                "buttons": [
                    {
                        "type": "web_url",
                        "url": common.getHomeUrl() + "/autoloan-capacity-specific?sender=" + sender,
                        "title": "Alright! 💼 💵",
                        "webview_height_ratio": "full",
                        "messenger_extensions": true
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
};

exports.carSpecificCallback = function (sender, params, mode, zlog) {
    user_params = {
        sender: sender,
        module: zlog.mod,
        action: zlog.act
    };
    var details = [];
    details.push(user_params);
    details.push(params);
    messages = [];
    utils.typing(sender);
    var change_something_url = "";
    if (mode === 'AUTOLOAN_CAR_SPECIFIC') {
        messages.push({
            text: "Got it. You chose " + params.car_model.brand + " "
                + params.car_model.model + " with a price of PHP "
                + common.numberWithCommas(params.car_model.srp) + ". You're looking at "
                + params.loanDownPayment + "% Downpayment or PHP "
                + common.numberWithCommas((params.car_model.srp * (params.loanDownPayment / 100)))
                + ". And the balance you are financing for " + params.loanTerm + " months. 👌"
        });
        change_something_url = common.getHomeUrl() + "/autoloan-car-specific?sender=" + sender
            + "&car_brand=" + params.car_model.brand
            + "&code=" + params.car_model.code;
    } else if (mode === 'AUTOLOAN_BUDGET_SPECIFIC') {
        messages.push({
            text: "Thanks. You picked " + params.car_model.brand + " "
                + params.car_model.model + " with a price of PHP "
                + common.numberWithCommas(params.car_model.srp) + " for your budget of PHP "
                + common.numberWithCommas(params.budget) + ". You're looking at "
                + params.loanDownPayment + "% Downpayment (PHP "
                + common.numberWithCommas((params.car_model.srp * (params.loanDownPayment / 100)))
                + ") and financing the balance for " + params.loanTerm + " months. 🙌"
        });
        change_something_url = common.getHomeUrl() + "/autoloan-budget-specific?sender=" + sender
            + "&car_brand=" + params.car_model.brand
            + "&code=" + params.car_model.code
            + "&budget=" + params.budget;
    } else if (mode === 'AUTOLOAN_CAPACITY_SPECIFIC') {
        messages.push({
            text: "Got it. Your Monthly Income is PHP " + common.numberWithCommas(params.monthly_income)
                + " and are looking at PHP " + common.numberWithCommas(params.downpayment_amount)
                + " Downpayment. Based on my estimate, you can afford a car priced at PHP "
                + common.numberWithCommas(params.car_price_budget) + "! Alright! 👏"
        });
        messages.push({
            text: "Then you selected " + params.car_model.brand + " "
                + params.car_model.model + " with a price of PHP "
                + common.numberWithCommas(params.car_model.srp) + ". And you're looking at financing it for " + params.loanTerm + " months."
        });
        change_something_url = common.getHomeUrl() + "/autoloan-capacity-specific?sender=" + sender
            + "&car_brand=" + params.car_model.brand
            + "&code=" + params.car_model.code
            + "&monthly_income=" + params.monthly_income
            + "&downpayment_amount=" + params.downpayment_amount;
    }


    messages.push({ text: "Here is your sample Total Cashout and Monthly Amortization. I also added a couple more options which I think you may find interesting." });

    var loan_params = [];
    //option 1
    loan_params.push({ option: 1, price: params.car_model.srp, dp: params.loanDownPayment, terms: params.loanTerm });
    //option 2
    var dp2 = params.loanDownPayment - 10;
    if (dp2 < 20) {
        dp2 = Number(params.loanDownPayment) + 10;
    }
    loan_params.push({ option: 2, price: params.car_model.srp, dp: dp2, terms: params.loanTerm });
    //option 3
    var term3 = Number(params.loanTerm) + 12;
    if (term3 > 60) {
        term3 = params.loanTerm - 12;
    }
    loan_params.push({ option: 3, price: params.car_model.srp, dp: params.loanDownPayment, terms: term3 });
    var options = [];
    async.forEach(Object.keys(loan_params),
        function (itr, callback) {
            var option = loan_params[itr].option;
            var car_price = loan_params[itr].price;
            var term = loan_params[itr].terms;
            var downpayment = loan_params[itr].dp / 100;
            var offset = "0";

            var amount_financed = car_price * downpayment;
            var amortization = 0;
            var loanable_amount = car_price - (amount_financed);
            var std = 0;
            var recommended_income = 0;
            var downpayment_amount = 0;

            switch (parseInt(term)) {
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
                form: { amount: loanable_amount }
            },
                function (err, httpResponse, body) {

                    var data = JSON.parse(body);
                    offset = Number(data[0]);

                    amortization = (loanable_amount + (loanable_amount * (std / 100))) / term;
                    recommended_income = amortization * 3;
                    downpayment_amount = amount_financed + offset;

                    options.push({
                        option: option,
                        car_brand: params.car_model.brand,
                        car_model: params.car_model.model,
                        code: params.car_model.code,
                        budget: params.budget,
                        price: car_price,
                        monthly_income_required: recommended_income,
                        amount_financed: loanable_amount,
                        chattel_mortgage_fees: offset,
                        total_cashout: downpayment_amount,
                        monthly_amortization: amortization,
                        terms: term,
                        downpayment: loan_params[itr].dp
                    });
                    callback();
                });

        }, function (err) {

            options.sort(function (a, b) {
                return parseFloat(a.option) - parseFloat(b.option);
            });

            var elements = [];
            var indx = 1;
            options.forEach(function (item) {
                change_something_url = change_something_url + "&dp=" + item.downpayment + "&term=" + item.terms;
                var val = item.price + "-" + item.monthly_income_required + "-"
                    + item.amount_financed + "-" + item.chattel_mortgage_fees + "-"
                    + item.total_cashout + "-" + item.monthly_amortization + "-"
                    + item.terms + "-" + item.downpayment + "-"
                    + item.car_brand + "-"
                    + item.car_model.code + "-"
                    + item.car_price_budget;
                elements.push({
                    "title": "Option " + indx,
                    "subtitle": "Total Cashout: Php " + common.numberWithCommas(item.total_cashout)
                        + "\nMonthly Amortization: Php " + common.numberWithCommas(item.monthly_amortization),
                    "buttons": [
                        {
                            "type": "postback",
                            "title": "View Details",
                            "payload": "VIEW_AUTO_LOAN_DETAILS_" + val
                        },
                        // {
                        //     "type": "postback",
                        //     "title": "Apply for this loan",
                        //     "payload": "APPLY_FOR_THIS_LOAN"
                        // },
                        {
                            "type": "web_url",
                            "url": "https://autoloan.unionbankph.com/apply?budget=" + item.budget + "&downpayment=" + item.downpayment + "&terms=" + item.terms + "&brand=" + item.car_brand + "&modelCode=" + item.code + "&modelName=" + item.car_model + "&modelSrp=" + item.price,
                            "title": "Apply for this loan"
                        },
                        {
                            "type": "web_url",
                            "url": change_something_url,
                            "title": "Change Something",
                            "webview_height_ratio": "full",
                            "messenger_extensions": true
                        }
                    ]
                });
                indx++;
            });


            messages.push({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": elements

                    }
                }
            });

            //        var quickReplies = [];
            //        quickReplies.push({
            //            "content_type": "text",
            //            "title": "Change Something",
            //            "payload": "CAR_LOAN_STEP1_OPTION" + params.option
            //        });
            //        quickReplies = quickReplies.concat(common.commonQuickReplies());
            messages.push({
                text: "Is there anything else you would like me to help you with?",
                quick_replies: common.commonQuickReplies()
            });
            utils.sendSeriesMessages(sender, messages);
            details.push(options);
        });

    utils.sendLogs({
        logtime: new Date(),
        user: sender,
        module: zlog.mod,
        action: zlog.act,
        skill: { name: "EXPLORE_AUTO_LOAN", mode: 's' },
        params: details
    });

    return user_params;

};


exports.viewAutoLoanDetails = function (sender, args) {

    var loan_details = {
        price: args[0],
        monthly_income_required: args[1],
        amount_financed: args[2],
        chattel_mortgage_fees: args[3],
        total_cashout: args[4],
        monthly_amortization: args[5],
        terms: args[6],
        downpayment: args[7],
        car_brand: args[8],
        car_model: args[9]
    };

    messages = [];

    messages.push({ text: "Here are the details of this option." });
    messages.push({
        text: "Your estimated Total Cashout is PHP "
            + common.numberWithCommas(loan_details.total_cashout)
            + " based on a " + common.numberWithCommas(loan_details.downpayment) + "% or PHP " + common.numberWithCommas(loan_details.price * (loan_details.downpayment / 100))
            + " Downpayment and a Chattel Mortgage Fee of PHP " + common.numberWithCommas(loan_details.chattel_mortgage_fees)
    });
    messages.push({
        text: "Monthly Amortization is estimated at PHP "
            + common.numberWithCommas(loan_details.monthly_amortization)
            + " when financing PHP " + common.numberWithCommas(loan_details.amount_financed) + " for " + (loan_details.terms) + " months."
    });
    messages.push({
        text: "For this option, a Monthly Income of PHP " + common.numberWithCommas(loan_details.monthly_income_required) + " is required."
        , quick_replies: [
            {
                "content_type": "text",
                "title": "Apply for this loan",
                "payload": "APPLY_FOR_THIS_LOAN"
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

// exports.applyforthisLoan = function (sender, params, zlog) {


//     user_params = {
//         sender: sender,
//         module: zlog.mod,
//         action: zlog.act
//     };
//     var details = [];
//     details.push(user_params);
//     details.push(params);
//     messages = [];
//     var message = {
//         "attachment": {
//             "type": "template",
//             "payload": {
//                 "template_type": "button",
//                 "text": "Let's switch to our website where you can begin your loan application. Is this ok with you?",
//                 "buttons": [    
//                     {
//                         "type": "web_url",
//                         "url": "autoloan.unionbankph.com/apply?budget=" + params.budget + "&downpayment=" + params.loanDownPayment + "&terms=" + params.loanTerm + "&brand=" + params.car_model.brand + "&modelCode=" + params.car_model.code + "&modelName=" + params.car_model.model + "&modelSrp=" + params.car_model.srp,
//                         "title": "Yes 👍 "
//                     },
//                     {
//                         "type": "postback",
//                         "title": "Not Now",
//                         "payload": "RESET"
//                     }
//                 ]
//             }
//         }
//     };
//     messages.push(message);
//     utils.sendSeriesMessages(sender, messages);


// };
