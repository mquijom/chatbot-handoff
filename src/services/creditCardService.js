var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var Client = require('node-rest-client').Client;
var request = require('request');
user_params = [];
var messages = [];

exports.findACreditCard = function (sender) {
    messages = [];
    messages.push({
        text: "Let's see. Which card benefit do you like? 🤔",
        quick_replies: [
            // {
            //     "content_type": "text",
            //     "title": "Application Status",
            //     "payload": "CC_APPLICATION_STATUS"
            // },
            {
                "content_type": "text",
                "title": "Travel ✈️",
                "payload": "LIST_CREDIT_CARD_TRAVEL"
            },
            {
                "content_type": "text",
                "title": "Cashback 💸",
                "payload": "LIST_CREDIT_CARD_CASHBACK"
            },
            {
                "content_type": "text",
                "title": "Rewards 🏆",
                "payload": "LIST_CREDIT_CARD_REWARDS"
            }
        ]
    });
    utils.sendSeriesMessages(sender, messages);
};

exports.listCreditCardTravel = function (sender) {
    messages = [];
    messages.push({
        text: "✈️ 🏝 Here's our great lineup of credit cards that help you earn points for free flights."
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                        "title": "Cebu Pacific GetGo Gold Visa",
                        "subtitle": "Get points faster so you can go places sooner!",
                        "image_url": common.getHomeUrl() + "/public/creditcards/getgo_gold.png",
                        "buttons": [{
                                "type": "postback",
                                "title": "Tell me more",
                                "payload": "TELL_ME_MORE_GET_GO_GOLD"
                            },
                            {
                                "title": "Apply Now",
                                "type": "web_url",
                                "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=Visa&cardcode=1163",
                                "webview_height_ratio": "full",
                                "messenger_extensions": true
                            }
                            // {
                            //     "title": "Apply Now",
                            //     "type": "web_url",
                            //     "url": "https://apply.unionbankph.com/?fbclid=" + sender + "&cardtype=Visa&cardcode=1163" ,
                            //     "webview_height_ratio": "full"
                            // }
                        ]
                    },
                    {
                        "title": "Cebu Pacific GetGo Platinum Credit Card",
                        "subtitle": "#FlyForFreeFaster and get exclusive Cebu Pacific travel perks!",
                        "image_url": common.getHomeUrl() + "/public/creditcards/getgo_platinum.png",
                        "buttons": [{
                                "type": "postback",
                                "title": "Tell me more",
                                "payload": "TELL_ME_MORE_GET_GO_PLATINUM"
                            },
                            // {
                            //     "title": "Apply Now",
                            //     "type": "web_url",
                            //     "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=Visa&cardcode=2213",
                            //     "webview_height_ratio": "full",
                            //     "messenger_extensions": true
                            // }
                            {
                                "title": "Apply Now",
                                "type": "web_url",
                                "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                                "webview_height_ratio": "full"
                            }
                        ]
                    },
                    {
                        "title": "Miles+ Platinum Card",
                        "subtitle": "Get more points from your travels!",
                        "image_url": common.getHomeUrl() + "/public/creditcards/miles_platinum.png",
                        "buttons": [{
                                "type": "postback",
                                "title": "Tell me more",
                                "payload": "TELL_ME_MORE_MILES_PALTINUM"
                            },
                            // {
                            //     "title": "Apply Now",
                            //     "type": "web_url",
                            //     "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=Visa&cardcode=2207",
                            //     "webview_height_ratio": "full",
                            //     "messenger_extensions": true
                            // }
                            {
                                "title": "Apply Now",
                                "type": "web_url",
                                "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                                "webview_height_ratio": "full"
                            }
                        ]
                    }
                ]
            }
        }
    });
    messages.push({
        text: "Apply for one and start earning points. 😎 🛄 🛫",
        quick_replies: common.commonQuickReplies()
    });

    utils.sendSeriesMessages(sender, messages);
};

exports.listCreditCardApplication = function (sender) {
    messages = [];
    messages.push({
        text: "✈️ 🏝 Here's our great lineup of credit cards that help you earn points for free flights."
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                        "title": "Visa",
                        "subtitle": "Get points faster so you can go places sooner!",
                        "image_url": common.getHomeUrl() + "/public/creditcards/visa.jpg",
                        "buttons": [{
                                "type": "postback",
                                "title": "Tell me more",
                                "payload": "TELL_ME_MORE_VISA"
                            },
                            // {
                            //     "title": "Apply Now",
                            //     "type": "web_url",
                            //     "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=Visa",
                            //     "webview_height_ratio": "full",
                            //     "messenger_extensions": true
                            // }
                            {
                                "title": "Apply Now",
                                "type": "web_url",
                                "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                                "webview_height_ratio": "full"
                            }
                        ]
                    },
                    {
                        "title": "Cashback Master Card",
                        "subtitle": "Get points faster so you can go places sooner!",
                        "image_url": common.getHomeUrl() + "/public/creditcards/cashback_mc.png",
                        "buttons": [{
                                "type": "postback",
                                "title": "Tell me more",
                                "payload": "TELL_ME_MORE_MASTER_CARD"
                            },
                            // {
                            //     "title": "Apply Now",
                            //     "type": "web_url",
                            //     "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=MC",
                            //     "webview_height_ratio": "full",
                            //     "messenger_extensions": true
                            // }
                            {
                                "title": "Apply Now",
                                "type": "web_url",
                                "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                                "webview_height_ratio": "full"
                            }
                        ]
                    }
                ]
            }
        }
    });
    utils.sendSeriesMessages(sender, messages);
};

exports.creditCardApplicationStatus = function (sender) {
    messages = [];
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Alright ! I’ll need to ask for your reference number to get the status of your credit card application",
                "buttons": [{
                        "type": "web_url",
                        "url": common.getHomeUrl() + "/application/status?sender=" + sender,
                        "title": "🔒 Proceed",
                        "webview_height_ratio": "tall",
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

exports.getGOGoldDetails = function (sender) {

    messages = [];

    messages.push({
        text: "#FlyForFreeFaster with the Cebu Pacific GetGo Gold Visa!"
    });
    messages.push({
        text: "Every PHP 30 spend earns 1 GetGo point that is automatically transferred to your GetGo account. No need to call us for redemption. We’re the only bank that can do this for you! 😉"
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Use your points to fly for free to any Cebu Pacific destination. With this card, you also get alerts on Cebu Pacific seat sales.",
                "buttons": [
                //         "title": "Apply Now",
                //         "type": "web_url",
                //         "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=Visa&cardcode=1163",
                //         "webview_height_ratio": "full",
                //         "messenger_extensions": true
                //     },
                {
                    "title": "Apply Now",
                    "type": "web_url",
                    "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                    "webview_height_ratio": "full"
                },     
                    {
                        "type": "postback",
                        "title": "Not Now",
                        "payload": "RESET"
                    }
                ]
            }
        }
    });
    utils.sendSeriesMessages(sender, messages);

};

exports.getVisaDetails = function (sender) {

    messages = [];

    messages.push({
        text: "#FlyForFreeFaster with the Cebu Pacific GetGo Gold Visa!"
    });
    messages.push({
        text: "Every PHP 30 spend earns 1 GetGo point that is automatically transferred to your GetGo account. No need to call us for redemption. We’re the only bank that can do this for you! 😉"
    });
    messages.push({
        text: "Use your points to fly for free to any Cebu Pacific destination. With this card, you also get alerts on Cebu Pacific seat sales."
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Let's head over to getgo.unionbankph.com/apply to apply.",
                "buttons": [{
                        // "type": "web_url",
                        // "url": common.getHomeUrl() + "/application-cc?sender=" + sender + "&cardtype=Visa",
                        // "title": "Go! ↗",
                        // "webview_height_ratio": "full",
                        // "messenger_extensions": true
                            "title": "Apply Now",
                            "type": "web_url",
                            "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                            "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Not Now",
                        "payload": "RESET"
                    }
                ]
            }
        }
    });
    utils.sendSeriesMessages(sender, messages);

};

exports.getMasterCardDetails = function (sender) {

    messages = [];

    messages.push({
        text: "The UnionBank MasterCard is accepted at over 30 million establishments and ATMs worldwide."
    });
    messages.push({
        text: "Earn 1.5% cash back on all your purchases, everyday. NO CAPs on how much you can earn. 😉"
    });
    messages.push({
        text: "There’s no need to remember confusing spend categories because you earn 1.5% cash back on EVERYTHING, EVERYWHERE."
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "Let's head over to unionbank application to apply.",
                "buttons": [{
                        // "type": "web_url",
                        // "url": common.getHomeUrl() + "/application-cc?sender=" + sender + "&cardtype=MC",
                        // "title": "Go! ↗",
                        // "webview_height_ratio": "full",
                        // "messenger_extensions": true
                        "title": "Apply Now",
                            "type": "web_url",
                            "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                            "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Not Now",
                        "payload": "RESET"
                    }
                ]
            }
        }
    });
    utils.sendSeriesMessages(sender, messages);

};

exports.getGOPlatinumDetails = function (sender) {

    messages = [];

    messages.push({
        text: "The Cebu Pacific GetGo Platinum Visa let's you #FlyForFreeFaster & enjoy exclusive travel benefits with Cebu Pacific."
    });
    messages.push({
        text: "Every PHP 30 spend earns 1 GetGo point that is automatically transferred to your GetGo account. No need to call us for redemption. We’re the only bank that can do this for you!"
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "To make your trip extra special, this comes with Priority Check-In and free 5kg extra baggage allowance on Cebu Pacific flights. You also get complimentary lounge access and travel insurance of up to PHP 10 million.",
                "buttons": [{
                        // "title": "Apply Now",
                        // "type": "web_url",
                        // "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=Visa&cardcode=2213",
                        // "webview_height_ratio": "full",
                        // "messenger_extensions": true
                        "title": "Apply Now",
                            "type": "web_url",
                            "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                            "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Not Now",
                        "payload": "RESET"
                    }
                ]
            }
        }
    });
    utils.sendSeriesMessages(sender, messages);
};

exports.milesPlatinumDetails = function (sender) {

    messages = [];

    messages.push({
        text: "Earn the most points from your travel expenses when you charge it to your Miles+ Platinum card."
    });
    messages.push({
        text: "Earn 1.5x points for every PHP 25 on travel-related spend. Then redeem your points for PAL Mabuhay Miles, Cebu Pacific GetGo Points, Cashback, AsiaTravel vouchers & more!"
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "It also comes with free lounge access at NAIA Terminal 3 (Skyview Lounge), NAIA Terminal 1 (Club Manila Lounge or MIASCOR Lounge) & Davao Int’l Airport (MIASCOR Lounge). And also a travel insurance of up to PHP 10 million when you use Miles+ Platinum on your airline tickets.",
                "buttons": [{
                        // "title": "Apply Now",
                        // "type": "web_url",
                        // "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=Visa&cardcode=2207",
                        // "webview_height_ratio": "full",
                        // "messenger_extensions": true
                        "title": "Apply Now",
                            "type": "web_url",
                            "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                            "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Not Now",
                        "payload": "RESET"
                    }
                ]
            }
        }
    });
    utils.sendSeriesMessages(sender, messages);
};


exports.listCreditCardRewards = function (sender) {
    messages = [];
    //    messages.push({text: "Whether you’re looking for free movie tickets, gift certificates,"
    //                + " miles or cash rebates for the purchases you make every day, we’ve got you covered with our Rewards credit cards."});
    //    messages.push(
    //            {
    //                "attachment": {
    //                    "type": "template",
    //                    "payload": {
    //                        "template_type": "generic",
    //                        "elements": [{
    //                                "title": "UnionBank Classic Visa Card",
    //                                "subtitle": "Enjoy the most features fit for the Business Class with our fully loaded card.",
    //                                "image_url": "https://talk-to-rafa.herokuapp.com/public/creditcards/rewards-classic-resized.png",
    //                                "buttons": [{
    //                                        "title": "Tell me more",
    //                                        "type": "web_url",
    //                                        "url": "https://www.unionbankph.com/personal/credit-cards/171-rewards/20-unionbank-classic-visa-card"
    //
    //                                    }
    //                                ]
    //                            },
    //                            {
    //                                "title": "UnionBank Gold Visa Card",
    //                                "subtitle": "Reach the skies in so many ways for FREE!",
    //                                "image_url": "https://talk-to-rafa.herokuapp.com/public/creditcards/rewards-gold-resized.png",
    //                                "buttons": [{
    //                                        "title": "Tell me more",
    //                                        "type": "web_url",
    //                                        "url": "https://www.unionbankph.com/personal/credit-cards/171-rewards/186-unionbank-gold-visa-card"
    //                                    }
    //                                ]
    //                            },
    //                            {
    //                                "title": "UnionBank Platinum Visa Card",
    //                                "subtitle": "The card designed for your life's many passions and unique experiences.",
    //                                "image_url": "https://talk-to-rafa.herokuapp.com/public/creditcards/rewards-platinum-resized.png",
    //                                "buttons": [{
    //                                        "title": "Tell me more",
    //                                        "type": "web_url",
    //                                        "url": "https://www.unionbankph.com/personal/credit-cards/171-rewards/187-unionbank-platinum-visa-card"
    //
    //                                    }
    //                                ]
    //                            }
    //                        ]
    //                    }
    //                }
    //            });
    //    messages.push({text: "Do you want to search for other credit cards?",
    //        quick_replies: [
    //            {
    //                "content_type": "text",
    //                "title": "Travel",
    //                "payload": "LIST_CREDIT_CARD_TRAVEL"
    //            },
    //            {
    //                "content_type": "text",
    //                "title": "Rewards",
    //                "payload": "LIST_CREDIT_CARD_REWARDS"
    //            },
    //            {
    //                "content_type": "text",
    //                "title": "Cashback",
    //                "payload": "LIST_CREDIT_CARD_CASHBACK"
    //            },
    //            {
    //                "content_type": "text",
    //                "title": "Not Now",
    //                "payload": "RESET"
    //            }]
    //    });

    messages.push({
        "attachment": {
            "type": "image",
            "payload": {
                "url": common.getHomeUrl() + "/public/creditcards/classic_gold.png"
            }
        }
    });

    messages.push({
        text: "🛍🏆 Good choice! With UnionBank Gold Visa, every PHP 35 spend earns you 1 Rewards point. Your points can be redeemed for our range of exciting shopping, dining, travel and entertainment treats. Plus your Rewards points don't expire so redeem at your convenience.👌"
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "And you get to have complimentary lounge access at NAIA Terminal 1 (Club Manila Lounge).",
                "buttons": [{
                        // "title": "Apply Now",
                        // "type": "web_url",
                        // "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=Visa&cardcode=1106",
                        // "webview_height_ratio": "full",
                        // "messenger_extensions": true
                        "title": "Apply Now",
                            "type": "web_url",
                            "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                            "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Not Now",
                        "payload": "RESET"
                    }
                ]
            }
        }
    });


    utils.sendSeriesMessages(sender, messages);
};


exports.listCreditCardCashback = function (sender) {
    messages = [];
    //    messages.push({text: "Get instant cash rebates on your purchases."});
    //    messages.push(
    //            {
    //                "attachment": {
    //                    "type": "template",
    //                    "payload": {
    //                        "template_type": "generic",
    //                        "elements": [{
    //                                "title": "UnionBank Platinum MasterCard",
    //                                "subtitle": "Everyday Savings Made SIMPLE",
    //                                "image_url": "https://talk-to-rafa.herokuapp.com/public/creditcards/cashback-platinum-resized.png",
    //                                "buttons": [{
    //                                        "title": "Tell me more",
    //                                        "type": "web_url",
    //                                        "url": "https://www.unionbankph.com/personal/credit-cards/cards/cashback/389-unionbank-platinum-mastercard"
    //                                    }
    //                                ]
    //                            }
    //                        ]
    //                    }
    //                }
    //            });
    //    messages.push({text: "Do you want to search for other credit cards?",
    //        quick_replies: [
    //            {
    //                "content_type": "text",
    //                "title": "Travel",
    //                "payload": "LIST_CREDIT_CARD_TRAVEL"
    //            },
    //            {
    //                "content_type": "text",
    //                "title": "Rewards",
    //                "payload": "LIST_CREDIT_CARD_REWARDS"
    //            },
    //            {
    //                "content_type": "text",
    //                "title": "Cashback",
    //                "payload": "LIST_CREDIT_CARD_CASHBACK"
    //            },
    //            {
    //                "content_type": "text",
    //                "title": "Not Now",
    //                "payload": "RESET"
    //            }]
    //    });

    messages.push({
        "attachment": {
            "type": "image",
            "payload": {
                "url": common.getHomeUrl() + "/public/creditcards/cashback_mc.png"
            }
        }
    });
    messages.push({
        text: "💸 🔙 Great! Our CashBack Platinum Mastercard is perfect for this. You get 1.5% Cashback on all your purchases! No Caps on how much you can earn and No Categories on where you can earn."
    });
    messages.push({
        text: "The cashback you earn does not expire so redeem at your convenience. 😉"
    });
    messages.push({
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "button",
                "text": "And it also comes with complimentary lounge access at NAIA Terminal 3 (Skyview Lounge), NAIA Terminal 1 (Club Manila Lounge or MIASCOR Lounge) and Davao International Airport (MIASCOR Lounge).",
                "buttons": [{
                        // "title": "Apply Now",
                        // "type": "web_url",
                        // "url": common.getHomeUrl() + "/application?sender=" + sender + "&cardtype=MC",
                        // "webview_height_ratio": "full",
                        // "messenger_extensions": true
                        "title": "Apply Now",
                            "type": "web_url",
                            "url": "https://apply.unionbankph.com/?fbclid=" + sender,
                            "webview_height_ratio": "full"
                    },
                    {
                        "type": "postback",
                        "title": "Not Now",
                        "payload": "RESET"
                    }
                ]
            }
        }
    });

    utils.sendSeriesMessages(sender, messages);
};