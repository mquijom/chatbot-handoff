var request = require('request');
var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');

var Client = require('node-rest-client').Client;

var async = require('async');
var user_params = [];


function callAtmApi(sender, coordinates) {
    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    var locationArray = [];
    client.get(common.getAtmURL(), args, function (data, response) {
        for (var i = 0; i < data.length; i++) {
            locationArray.push({
                "value": utils.distance(data[i].latitude, data[i].longitude, coordinates.lat, coordinates.long, "K"),
                "id": data[i].id,
                "name": data[i].name,
                "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                "latitude": data[i].latitude,
                "longitude": data[i].longitude
            });
        }
        return locationArray;
    });
}


exports.viewATMInfo = function (sender, atm_id) {

    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };



    var branchLocations = [];
    var atmLocations = [];
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
                        "id": data[i].id,
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
                        "id": data[i].id,
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
        var atms = atmLocations.concat(branchLocations);
        var atm = [];
        for (var i = 0; i < atms.length; i++) {
            if (atms[i].id == parseInt(atm_id)) {
                atm = atms[i];
                break;
            }

        }

        var messages = [];
        var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + atm.latitude + "," + atm.longitude + "&zoom=15&markers=" + atm.latitude + "," + atm.longitude;
        messages.push({
            "attachment": {
                "type": "image",
                "payload": {
                    "url": locationMap
                }
            }
        });

        messages.push({
            text: atm.address.replace(/[&]nbsp[;]/gi, " "),
            "quick_replies": common.commonQuickReplies()
        });

        utils.sendSeriesMessages(sender, messages);
    });


};

//find Nearby ATMs
exports.findNearByATMs = function (sender, coordinates, callback) {
    user_params[sender] = {};
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: common.getToken()
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: {
                text: "Thanks for sending. Let me look for nearby ATMs. 📡"
            }
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        utils.typing(sender);
    });

    // var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.lat + "," + coordinates.long + "&sensor=false";
    // user_params[sender].url = url;
    // user_params[sender].coordinates = coordinates;
    // request({
    //     url: url,
    //     method: 'GET'
    // }, function (error, response, body) {
    //     console.log('########## Googlemap: ' + JSON.stringify(body));
    //     var loc = JSON.parse(body);
    //     if (loc.error_message) {
    //         console.log('############### Error in Googlemap: ' + loc.error_message);
    //     } else {
    //         var loc_add = loc.results[0].formatted_address;
    //         user_params[sender].location = loc_add;

    //         if (loc_add.indexOf('Philippines') === -1) {
    //             var messages = [];
    //             messages.push({ text: "Sorry, the location is too far." });
    //             messages.push({
    //                 text: 'Is there anything else I can help you with?',
    //                 quick_replies: common.commonQuickReplies()
    //             });
    //             utils.sendSeriesMessages(sender, messages);

    //             callback(user_params[sender]);
    //         }


    user_params[sender].distance = [];
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


            client.get(common.getAtmURL(), args, function (atms, response) {
                console.log('ATM: ' + JSON.stringify(data))
                var data = atms.records;
                for (var i = 0; i < data.length; i++) {
                    var distance_value = utils.distance(data[i].latitude, data[i].longitude, coordinates.lat, coordinates.long, "K");
                    atmLocations.push({
                        "value": distance_value,
                        "dist": Math.round(distance_value * 100) / 100,
                        "id": data[i].id,
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

            client.get(common.getBranchURL(), args, function (branches, response) {
                console.log('BRANCH: ' + JSON.stringify(data))
                var data = branches.records;
                for (var i = 0; i < data.length; i++) {
                    var distance_value = utils.distance(data[i].latitude, data[i].longitude, coordinates.lat, coordinates.long, "K");
                    branchLocations.push({
                        "value": distance_value,
                        "dist": Math.round(distance_value * 100) / 100,
                        "id": data[i].id,
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

        user_params[sender].distance = atmLocations.concat(branchLocations);
        // console.log('MERGE: ' + JSON.stringify(user_params[sender].distance))
        user_params[sender].distance.sort(function (a, b) {
            return a.value - b.value;
        });

        console.log("length: " + user_params[sender].distance.length);
        for (var i = 0; i < user_params[sender].distance.length; i++) {
            console.log(user_params[sender].distance[i].name + "-" + user_params[sender].distance[i].value);
        }

        var messages = [];
        var from_add = coordinates.lat + "," + coordinates.long;
        var msg_elements = [];
        if (user_params[sender].distance.length >= 1) {
            for (var i = 0; i < 3 && i < user_params[sender].distance.length; i++) {
                msg_elements.push({
                    "title": user_params[sender].distance[i].name + " (" + user_params[sender].distance[i].dist + " km away)",
                    "subtitle": user_params[sender].distance[i].address.replace(/[&]nbsp[;]/gi, " "),
                    "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude + "&zoom=15&markers=" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude,
                    "buttons": [{
                            "type": "postback",
                            "title": "Get Directions",
                            "payload": "GET_DIRECTIONS_" + from_add + "-" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude + "_" + user_params[sender].distance[i].address + "_ATM"
                        },
                        {
                            "type": "postback",
                            "title": "View Info",
                            "payload": "ATM_INFO_" + user_params[sender].distance[i].id
                        }
                    ]
                });
            }
            messages.push({
                text: 'Found them! Here are the 3 closest ATMs'
            });
            messages.push({
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": msg_elements
                    }
                }
            });
        } else {
            messages.push({
                text: "Sorry we don't have any atm or branch on your current location."
            });
        }
        messages.push({
            text: 'Is there anything else I can help you with?',
            quick_replies: common.commonQuickReplies()
        });
        //        messages.push(utils.constructEndGreeting());
        utils.sendSeriesMessages(sender, messages);
        // var messageData = {
        //     "attachment": {
        //         "type": "template",
        //         "payload": {
        //             "template_type": "generic",
        //             "elements": [{
        //                 "title": user_params[sender].distance[0].name + " (" + user_params[sender].distance[0].dist + " km away)",
        //                 "subtitle": user_params[sender].distance[0].address.replace(/[&]nbsp[;]/gi, " "),
        //                 "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "&zoom=15&markers=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude,
        //                 "buttons": [{
        //                     "type": "postback",
        //                     "title": "Get Directions",
        //                     "payload": "GET_DIRECTIONS_" + from_add + "-" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "_" + user_params[sender].distance[0].address + "_ATM"
        //                 },
        //                 {
        //                     "type": "postback",
        //                     "title": "View Info",
        //                     "payload": "ATM_INFO_" + user_params[sender].distance[0].id
        //                 }]
        //             },
        //             {
        //                 "title": user_params[sender].distance[1].name + " (" + user_params[sender].distance[1].dist + " km away)",
        //                 "subtitle": user_params[sender].distance[1].address.replace(/[&]nbsp[;]/gi, " "),
        //                 "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[1].latitude + "," + user_params[sender].distance[1].longitude + "&zoom=15&markers=" + user_params[sender].distance[1].latitude + "," + user_params[sender].distance[1].longitude,
        //                 "buttons": [{
        //                     "type": "postback",
        //                     "title": "Get Directions",
        //                     "payload": "GET_DIRECTIONS_" + from_add + "-" + user_params[sender].distance[1].latitude + "," + user_params[sender].distance[1].longitude + "_" + user_params[sender].distance[1].address + "_ATM"
        //                 },
        //                 {
        //                     "type": "postback",
        //                     "title": "View Info",
        //                     "payload": "ATM_INFO_" + user_params[sender].distance[1].id
        //                 },
        //                     //                                {
        //                     //                                    "type": "phone_number",
        //                     //                                    "title": "Call Now",
        //                     //                                    "payload": "+6328418600"
        //                     //                                }
        //                 ]
        //             },
        //             {
        //                 "title": user_params[sender].distance[2].name + " (" + user_params[sender].distance[2].dist + " km away)",
        //                 "subtitle": user_params[sender].distance[2].address.replace(/[&]nbsp[;]/gi, " "),
        //                 "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[2].latitude + "," + user_params[sender].distance[2].longitude + "&zoom=15&markers=" + user_params[sender].distance[2].latitude + "," + user_params[sender].distance[2].longitude,
        //                 "buttons": [{
        //                     "type": "postback",
        //                     "title": "Get Directions",
        //                     "payload": "GET_DIRECTIONS_" + from_add + "-" + user_params[sender].distance[2].latitude + "," + user_params[sender].distance[2].longitude + "_" + user_params[sender].distance[2].address + "_ATM"
        //                 },
        //                 {
        //                     "type": "postback",
        //                     "title": "View Info",
        //                     "payload": "ATM_INFO_" + user_params[sender].distance[2].id
        //                 },
        //                     //                                {
        //                     //                                    "type": "phone_number",
        //                     //                                    "title": "Call Now",
        //                     //                                    "payload": "+6328418600"
        //                     //                                }

        //                 ]
        //             }]
        //         }
        //     }

        // };

        callback(user_params[sender]);
    });
    //     }
    // });



};

//find All ATMs
exports.findAll = function (sender) {
    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    client.get(common.getAtmURL(), args, function (data, response) {
        user_params[sender] = [];
        user_params[sender].atms = [];

        var resultlength = data.length;
        if (resultlength > 4) {
            resultlength = 4;
        }

        var messageData = [];
        if (resultlength < 2) {
            var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + data[0].latitude + "," + data[0].longitude + "&zoom=15&markers=" + data[0].latitude + "," + data[0].longitude;
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": data[0].name,
                            "subtitle": data[0].address.replace(/[&]nbsp[;]/gi, " "),
                            "image_url": locationMap
                        }]
                    }
                }
            };
        } else {
            for (var i = 0; i < resultlength; i++) {
                user_params[sender].atms[i] = {
                    "title": data[i].name,
                    "subtitle": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                    "buttons": [{
                        "title": "View Details",
                        "type": "postback",
                        "payload": "VIEW_ATMS_" + data[i].id
                    }]
                };
            }

            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
                        "top_element_style": "compact",
                        "elements": user_params[sender].atms,
                        "buttons": [{
                            "title": "View More",
                            "type": "postback",
                            "payload": "VIEW_MORE_ATMS_4"
                        }]
                    }
                }
            };

        }
        utils.sendMessage(sender, messageData);

    });
};

//find more ATMs
exports.viewMoreATMs = function (sender, start_index, keyword) {

    var pattern = new RegExp(".*" + keyword + ".*", "ig");

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

                    if (pattern.test(data[i].address)) {
                        console.log("match address: " + data[i].address);
                        atmLocations.push({
                            "id": data[i].id,
                            "name": data[i].name,
                            "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                            "latitude": data[i].latitude,
                            "longitude": data[i].longitude
                        });
                    }

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
                    if (pattern.test(data[i].address)) {
                        console.log("match address: " + data[i].address);
                        branchLocations.push({
                            "id": data[i].id,
                            "name": data[i].name,
                            "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                            "latitude": data[i].latitude,
                            "longitude": data[i].longitude
                        });
                    }
                }
                callback();
            });
        }
    ], function (err) {

        var atms = atmLocations.concat(branchLocations);

        atms.sort(function (a, b) {
            return a.name - b.name;
        });

        var resultlength = atms.length;

        if (start_index >= resultlength) {
            utils.sendMessage(sender, {
                text: 'No more ATMS found.',
                "quick_replies": common.commonQuickReplies()
            });
            return;
        }

        var end_index = parseInt(start_index) + 4;

        if (end_index > resultlength) {
            end_index = resultlength;
        }


        user_params[sender].atms = [];
        for (var i = start_index; i < end_index; i++) {
            var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + atms[i].latitude + "," + atms[i].longitude + "&zoom=15&markers=" + atms[i].latitude + "," + atms[i].longitude;
            user_params[sender].atms.push({
                "title": atms[i].name,
                "subtitle": atms[i].address.replace(/[&]nbsp[;]/gi, " "),
                "image_url": locationMap,
                "buttons": [{
                    "title": "View Details",
                    "type": "postback",
                    "payload": "VIEW_ATMS_" + atms[i].id
                }]
            });
        }

        resultlength = user_params[sender].atms.length;
        var messageData = [];
        if (resultlength < 2) {
            var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].atms[0].latitude + "," + user_params[sender].atms[0].longitude + "&zoom=15&markers=" + user_params[sender].atms[0].latitude + "," + user_params[sender].atms[0].longitude;
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": user_params[sender].atms[0].name,
                            "subtitle": user_params[sender].atms[0].address.replace(/[&]nbsp[;]/gi, " "),
                            "image_url": locationMap
                        }]
                    }
                }
            };
        } else {
            var payload = "VIEW_MORE_ATMS_" + end_index + "-" + keyword;
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
                        "top_element_style": "compact",
                        "elements": user_params[sender].atms,
                        "buttons": [{
                            "title": "View More",
                            "type": "postback",
                            "payload": payload
                        }]
                    }
                },
                "quick_replies": common.commonQuickReplies()
            };
        }
        utils.sendMessage(sender, messageData);


    });
};

//find ATM
exports.findATM = function (sender, atm_id) {

    var branchLocations = [];
    var atmLocations = [];
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
                        "id": data[i].id,
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
                        "id": data[i].id,
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
        var atms = atmLocations.concat(branchLocations);
        var atm = [];
        for (var i = 0; i < atms.length; i++) {
            console.log("ATM_ID: " + atms[i].id + " KEYWORD: " + atm_id + " reSULT: " + (atms[i].id == atm_id));
            if (atms[i].id == atm_id) {
                atm = atms[i];
            }
        }

        var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + atm.latitude + "," + atm.longitude + "&zoom=15&markers=" + atm.latitude + "," + atm.longitude;

        var messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": atm.name,
                        "subtitle": atm.address.replace(/[&]nbsp[;]/gi, " "),
                        "image_url": locationMap,
                        "buttons": [{
                                "type": "postback",
                                "title": "Get Directions",
                                "payload": "FIND_DIRECTIONS_" + atm.latitude + "," + atm.longitude
                            },
                            {
                                "type": "postback",
                                "title": "View Info",
                                "payload": "ATM_INFO_" + atm.id
                            },
                            //                                {
                            //                                    "type": "phone_number",
                            //                                    "title": "Call Now",
                            //                                    "payload": "+6328418600"
                            //                                }
                        ]
                    }]
                }
            },
            "quick_replies": common.commonQuickReplies()
        };

        utils.sendMessage(sender, messageData);
    });

};

//search by location
exports.search = function (sender) {
    var messages = [];

    messages.push({
        text: "Got it. Let's look for an ATM. 🔎"
    });
    messages.push({
        "text": "Can you send your current location or any location where you want to find the closest ATM?"
    });
    messages.push({
        "text": "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal.",
        "quick_replies": [{
                "content_type": "location"
            },
            {
                "content_type": "text",
                "title": "Not Now",
                "payload": "RESET"
            }
            //            {
            //                "content_type": "text",
            //                "title": "View all",
            //                "payload": "VIEW_ALL_ATMS"
            //            },
            //            {
            //                "content_type": "text",
            //                "title": "Main Menu",
            //                "payload": "MENU"
            //            }
        ]
    });
    //
    // messages.push({ text: "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal." });

    utils.sendSeriesMessages(sender, messages);
};

//find ATMs by keywords
exports.findATMByKeyword = function (sender, keyword) {

    var pattern = new RegExp(".*" + keyword + ".*", "ig");
    user_params[sender] = [];
    user_params[sender].keyword = keyword;
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: common.getToken()
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: {
                text: "Please wait while I search for nearby ATMs."
            }
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        utils.typing(sender);
    });

    user_params[sender] = [];
    user_params[sender].distance = [];
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

                    if (pattern.test(data[i].address)) {
                        console.log("match address: " + data[i].address);
                        atmLocations.push({
                            "id": data[i].id,
                            "name": data[i].name,
                            "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                            "latitude": data[i].latitude,
                            "longitude": data[i].longitude
                        });
                    }

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
                    if (pattern.test(data[i].address)) {
                        console.log("match address: " + data[i].address);
                        branchLocations.push({
                            "id": data[i].id,
                            "name": data[i].name,
                            "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                            "latitude": data[i].latitude,
                            "longitude": data[i].longitude
                        });
                    }
                }
                callback();
            });
        }
    ], function (err) {

        user_params[sender].distance = atmLocations.concat(branchLocations);


        if (user_params[sender].distance === null ||
            user_params[sender].distance === undefined ||
            user_params[sender].distance.length === 0) {
            var messages = {
                text: 'No ATMs found',
                "quick_replies": common.commonQuickReplies()
            };

            utils.sendMessage(sender, messages);
            return;
        }

        user_params[sender].distance.sort(function (a, b) {
            return a.name - b.name;
        });

        var resultLength = user_params[sender].distance.length;
        if (resultLength > 4) {
            resultLength = 4;
        }

        var elements = [];

        for (var i = 0; i < resultLength; i++) {

            elements.push({
                "title": user_params[sender].distance[i].name,
                "subtitle": user_params[sender].distance[i].address.replace(/[&]nbsp[;]/gi, " "),
                "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude + "&zoom=15&markers=" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude,
                "buttons": [{
                    "title": "View Details",
                    "type": "postback",
                    "payload": "VIEW_ATMS_" + user_params[sender].distance[i].id
                }]
            });
        }

        var messageData = [];
        if (elements.length == 1) {
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": user_params[sender].distance[0].name,
                            "subtitle": user_params[sender].distance[0].address.replace(/[&]nbsp[;]/gi, " "),
                            "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "&zoom=15&markers=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude,
                            "buttons": [{
                                    "type": "postback",
                                    "title": "Get Directions",
                                    "payload": "FIND_DIRECTIONS_" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude
                                },
                                {
                                    "type": "postback",
                                    "title": "View Info",
                                    "payload": "ATM_INFO_" + user_params[sender].distance[0].id
                                },
                                //                                    {
                                //                                        "type": "phone_number",
                                //                                        "title": "Call Now",
                                //                                        "payload": "+6328418600"
                                //                                    }
                            ]
                        }]
                    }
                },
                "quick_replies": common.commonQuickReplies()
            };
        } else {

            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
                        "top_element_style": "compact",
                        "elements": elements,
                        "buttons": [{
                            "title": "View More",
                            "type": "postback",
                            "payload": "VIEW_MORE_ATMS_4-" + keyword
                        }]
                    }
                },
                "quick_replies": common.commonQuickReplies()
            };
        }

        var messages = [];
        messages.push({
            text: 'I have found ' + user_params[sender].distance.length + ' ATM locations.'
        });
        messages.push(messageData);
        utils.sendSeriesMessages(sender, messages);



    });
    return user_params[sender].keyword;
};