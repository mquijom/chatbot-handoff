
var request = require('request');
var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');
var Client = require('node-rest-client').Client;


var user_params = [];

exports.callBranchApi = function (sender, coordinates) {
    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    var locationArray = [];
    client.get(common.getBranchURL(), args, function (data, response) {
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
};

//find specific branch
exports.findBranch = function (sender, branch_id) {
    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": client_id,
            "x-ibm-client-secret": client_secret
        }
    };

    client.get(common.getBranchURL(), args, function (data, response) {
        var branch = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].id == branch_id) {
                branch = data[i];
                break;
            }

        }

        var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + branch.latitude + "," + branch.longitude + "&zoom=15&markers=" + branch.latitude + "," + branch.longitude
            + "&keys=" + common.getGooleAPIKey();

        var messageData = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": [{
                        "title": branch.name,
                        "subtitle": branch.address.replace(/[&]nbsp[;]/gi, " "),
                        "image_url": locationMap,
                        "buttons": [
                            {
                                "title": "Get Directions",
                                "type": "postback",
                                "payload": "FIND_DIRECTIONS_" + branch.latitude + "," + branch.longitude
                            },
                            {
                                "type": "postback",
                                "title": "View Info",
                                "payload": "BRANCH_INFO_" + user_params[sender].distance[0].id
                            },
                            //                                {
                            //                                    "type": "phone_number",
                            //                                    "title": "Call Now",
                            //                                    "payload": "+6328418600"
                            //                                }
                        ]
                    }]
                }
            }
        };
        utils.sendMessage(sender, messageData);
    });
};

//find specific branch
exports.viewBranchInfo = function (sender, branch_id, callback) {
    user_params[sender] = {};
    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    client.get(common.getBranchURL(), args, function (data, response) {
        user_params[sender].api = "BRANCH LOCATOR";
        user_params[sender].end_point = common.getBranchURL();

        var branch = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].id == parseInt(branch_id)) {
                branch = data[i];
                user_params[sender].response = branch;
                break;
            }

        }

        var messages = [];
        var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + branch.latitude + "," + branch.longitude + "&zoom=15&markers=" + branch.latitude + "," + branch.longitude + "&keys=" + common.getGooleAPIKey();
        //        var locationMap = "https://talk-to-rafa.herokuapp.com/location";
        user_params[sender].locationMap = locationMap;
        messages.push({
            "attachment": {
                "type": "image",
                "payload": {
                    "url": locationMap
                }
            }
        });
        console.log("address" + branch.address);
        messages.push({
            text: branch.address.replace(/[&]nbsp[;]/gi, " "),
            "quick_replies": common.commonQuickReplies()
        });

        utils.sendSeriesMessages(sender, messages);
        callback(user_params[sender]);
    });
};

//find Nearby Branches
exports.findNearByBranches = function (sender, coordinates, callback) {

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: common.getToken() },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: { text: "Got the location. Let me look for nearby branches. 📡" }
        }
    }, function (error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
        utils.typing(sender);
    });


    var messages = [];
    user_params[sender] = {};
    var url = "http://maps.googleapis.com/maps/api/geocode/json?latlng=" + coordinates.lat + "," + coordinates.long + "&sensor=false";
    user_params[sender].url = url;
    user_params[sender].coordinates = coordinates;
    request({
        url: url,
        method: 'GET'
    }, function (error, response, body) {

        var loc = JSON.parse(body);
        var loc_add = loc.results[0].formatted_address;
        user_params[sender].location = loc_add;

        if (loc_add.indexOf('Philippines') === -1) {

            messages.push({ text: "Sorry, the location is too far." });
            messages.push({
                text: 'Is there anything else I can help you with?',
                quick_replies: common.commonQuickReplies()
            });
            utils.sendSeriesMessages(sender, messages);

            callback(user_params[sender]);
        }

        var client = new Client();
        var args = {
            headers: {
                "Content-Type": "application/json",
                "x-ibm-client-id": common.getClientId(),
                "x-ibm-client-secret": common.getClientSecret()
            }
        };

        client.get(common.getBranchURL(), args, function (data, response) {
            console.log('@@@@@@@@@@@@@@@@@@@ LONGLAT::: ' + JSON.stringify(data) + '@@@@@@@@@@@@@@@@@@@@@@@@@@@@' + response);
            user_params[sender].api = "BRANCH LOCATOR";
            user_params[sender].end_point = common.getBranchURL();
            // user_params[sender].response = response;
            if (data.httpCode) {
                user_params[sender].response = data;
                callback(user_params[sender]);
            } else {
                user_params[sender].distance = [];

                for (var i = 0; i < data.length; i++) {
                    var distance_value = utils.distance(data[i].latitude, data[i].longitude, coordinates.lat, coordinates.long, "K");
                    user_params[sender].distance.push({
                        "value": distance_value,
                        "dist": Math.round(distance_value * 100) / 100,
                        "id": data[i].id,
                        "name": data[i].name,
                        "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                        "latitude": data[i].latitude,
                        "longitude": data[i].longitude
                    });
                }

                user_params[sender].distance.sort(function (a, b) {
                    return a.value - b.value;
                });

                var from_add = coordinates.lat + "," + coordinates.long;
                // console.log("@@@@@@@@@@@@@@@@@@@ https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "&zoom=15&markers=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "&keys=" + common.getGooleAPIKey());
                var msg_elements = [];
                var messages = [];
                if (user_params[sender].distance.length >= 1) {
                    for (var i = 0; i < 3 && i < user_params[sender].distance.length; i++) {
                        msg_elements.push({
                            "title": user_params[sender].distance[i].name + " (" + user_params[sender].distance[i].dist + " km away)",
                            "subtitle": user_params[sender].distance[i].address.replace(/[&]nbsp[;]/gi, " "),
                            "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude + "&zoom=15&markers=" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude + "&keys=" + common.getGooleAPIKey(),
                            "buttons": [{
                                "type": "postback",
                                "title": "Get Directions",
                                "payload": "GET_DIRECTIONS_" + from_add + "-" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude + "_" + user_params[sender].distance[i].address + "_BRANCH"
                            },
                            {
                                "type": "postback",
                                "title": "View Info",
                                "payload": "BRANCH_INFO_" + user_params[sender].distance[i].id
                            }]
                        });
                    }

                    messages.push({ text: 'Found them! Here are the 3 closest Branches.' });
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
                    messages.push({ text: "Sorry we don't have any branch on your current location." });
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
                //                 "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "&zoom=15&markers=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "&keys=" + common.getGooleAPIKey(),
                //                 "buttons": [{
                //                     "type": "postback",
                //                     "title": "Get Directions",
                //                     "payload": "GET_DIRECTIONS_" + from_add + "-" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "_" + user_params[sender].distance[0].address + "_BRANCH"
                //                 },
                //                 {
                //                     "type": "postback",
                //                     "title": "View Info",
                //                     "payload": "BRANCH_INFO_" + user_params[sender].distance[0].id
                //                 },
                //                     //                                {
                //                     //                                    "type": "phone_number",
                //                     //                                    "title": "Call Now",
                //                     //                                    "payload": "+6328418600"
                //                     //                                }
                //                 ]
                //             },
                //             {
                //                 "title": user_params[sender].distance[1].name + " (" + user_params[sender].distance[1].dist + " km away)",
                //                 "subtitle": user_params[sender].distance[1].address.replace(/[&]nbsp[;]/gi, " "),
                //                 "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[1].latitude + "," + user_params[sender].distance[1].longitude + "&zoom=15&markers=" + user_params[sender].distance[1].latitude + "," + user_params[sender].distance[1].longitude + "&keys=" + common.getGooleAPIKey(),
                //                 "buttons": [{
                //                     "type": "postback",
                //                     "title": "Get Directions",
                //                     "payload": "GET_DIRECTIONS_" + from_add + "-" + user_params[sender].distance[1].latitude + "," + user_params[sender].distance[1].longitude + "_" + user_params[sender].distance[1].address + "_BRANCH"
                //                 },
                //                 {
                //                     "type": "postback",
                //                     "title": "View Info",
                //                     "payload": "BRANCH_INFO_" + user_params[sender].distance[1].id
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
                //                 "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[2].latitude + "," + user_params[sender].distance[2].longitude + "&zoom=15&markers=" + user_params[sender].distance[2].latitude + "," + user_params[sender].distance[2].longitude + "&keys=" + common.getGooleAPIKey(),
                //                 "buttons": [{
                //                     "type": "postback",
                //                     "title": "Get Directions",
                //                     "payload": "GET_DIRECTIONS_" + from_add + "-" + user_params[sender].distance[2].latitude + "," + user_params[sender].distance[2].longitude + "_" + user_params[sender].distance[2].address + "_BRANCH"
                //                 },
                //                 {
                //                     "type": "postback",
                //                     "title": "View Info",
                //                     "payload": "BRANCH_INFO_" + user_params[sender].distance[2].id
                //                 },
                //                     //                                {
                //                     //                                    "type": "phone_number",
                //                     //                                    "title": "Call Now",
                //                     //                                    "payload": "+6328418600"
                //                     //                                }
                //                 ]
                //             }
                //             ]
                //         }
                //     }
                // };
                console.log('location user params: ' + JSON.stringify(user_params[sender]));
                callback(user_params[sender]);
            }
        });
    });
};

//find more ATMs
exports.viewMoreBranches = function (sender, start_index, keyword) {
    console.log("calling viewMoreBranches ...");

    var pattern = new RegExp(".*" + keyword + ".*", "ig");


    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };
    var branches = [];
    client.get(common.getBranchURL(), args, function (data, response) {
        for (var i = 0; i < data.length; i++) {
            if (pattern.test(data[i].address)) {
                console.log("match address: " + data[i].address);
                branches.push({
                    "id": data[i].id,
                    "name": data[i].name,
                    "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                    "latitude": data[i].latitude,
                    "longitude": data[i].longitude
                });
            }
        }

        branches.sort(function (a, b) {
            return a.name - b.name;
        });

        var resultlength = branches.length;

        console.log("start_index: " + start_index);
        console.log("resultlength: " + resultlength);

        if (start_index >= resultlength) {
            utils.sendMessage(sender, {
                text: 'No more Branches found.',
                quick_replies: common.commonQuickReplies()
            });
            return;
        }

        var end_index = parseInt(start_index) + 4;

        if (end_index > resultlength) {
            end_index = resultlength;
        }

        console.log("start_index: " + start_index);
        console.log("end_index: " + end_index);
        console.log("resultlength: " + resultlength);

        user_params[sender].branches = [];
        for (var i = start_index; i < end_index; i++) {
            var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + branches[i].latitude + "," + branches[i].longitude + "&zoom=15&markers=" + branches[i].latitude + "," + branches[i].longitude + "&keys=" + common.getGooleAPIKey();
            user_params[sender].branches.push({
                "title": branches[i].name,
                "subtitle": branches[i].address.replace(/[&]nbsp[;]/gi, " "),
                "image_url": locationMap,
                "buttons": [
                    {
                        "title": "View Details",
                        "type": "postback",
                        "payload": "VIEW_BRANCH_" + branches[i].id
                    }
                ]
            });
        }

        var messageData = [];
        if (resultlength < 2) {
            var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].branches[0].latitude + "," + user_params[sender].branches[0].longitude + "&zoom=15&markers=" + user_params[sender].branches[0].latitude + "," + user_params[sender].branches[0].longitude + "&keys=" + common.getGooleAPIKey();
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": [{
                            "title": user_params[sender].branches[0].name,
                            "subtitle": user_params[sender].branches[0].address.replace(/[&]nbsp[;]/gi, " "),
                            "image_url": locationMap
                        }]
                    }
                },
                "quick_replies": common.commonQuickReplies()
            };
        } else {
            var payload = "VIEW_MORE_BRANCH_" + end_index + "-" + keyword;
            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
                        "top_element_style": "compact",
                        "elements": user_params[sender].branches,
                        "buttons": [
                            {
                                "title": "View More",
                                "type": "postback",
                                "payload": payload
                            }
                        ]
                    }
                },
                "quick_replies": common.commonQuickReplies()
            };
        }
        utils.sendMessage(sender, messageData);
    });
};

//find more branches
//exports.viewMoreBranches = function (sender, start_index) {
//    var client = new Client();
//    var args = {
//        headers: {"Content-Type": "application/json",
//            "x-ibm-client-id": client_id,
//            "x-ibm-client-secret": client_secret
//        }
//    };
//
//    client.get(branch_url, args, function (data, response) {
//        user_params[sender] = [];
//        user_params[sender].branches = [];
//
//        var resultlength = data.length;
//
//
//        if (start_index >= resultlength) {
//            utils.sendTextMessage(sender, 'No more Branches found.');
//            return;
//        }
//
//        var end_index = parseInt(start_index) + 4;
//        console.log("end_index: " + end_index);
//
//        if (end_index > resultlength) {
//            end_index = resultlength;
//        }
//
//        var index = 0;
//        for (var i = start_index; i < end_index; i++) {
//
//            user_params[sender].branches[index] = {
//                "title": data[i].name,
//                "subtitle": data[i].address.replace(/[&]nbsp[;]/gi, " "),
//                "buttons": [
//                    {
//                        "title": "View Details",
//                        "type": "postback",
//                        "payload": "VIEW_BRANCH_" + data[i].id
//                    }
//                ]
//            };
//            index = index + 1;
//        }
//
//        resultlength = user_params[sender].branches.length;
//        console.log("resultlength: " + resultlength);
//        console.log(user_params[sender].branches);
//        var messageData = [];
//        if (resultlength < 2) {
//            var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].branches[0].latitude + "," + user_params[sender].branches[0].longitude + "&zoom=15&markers=" + user_params[sender].branches[0].latitude + "," + user_params[sender].branches[0].longitude;
//            messageData = {
//                "attachment": {
//                    "type": "template",
//                    "payload": {
//                        "template_type": "generic",
//                        "elements": [{
//                                "title": user_params[sender].branches[0].name,
//                                "subtitle": user_params[sender].branches[0].address.replace(/[&]nbsp[;]/gi, " "),
//                                "image_url": locationMap
//                            }]
//                    }
//                }
//            };
//        } else {
//            var payload = "VIEW_MORE_BRANCHES_" + end_index;
//            messageData = {
//                "attachment": {
//                    "type": "template",
//                    "payload": {
//                        "template_type": "list",
//                        "top_element_style": "compact",
//                        "elements": user_params[sender].branches,
//                        "buttons": [
//                            {
//                                "title": "View More",
//                                "type": "postback",
//                                "payload": payload
//                            }
//                        ]
//                    }
//                }
//            };
//        }
//        utils.sendMessage(sender, messageData);
//    });
//};

//find All Branches
exports.findAll = function (sender) {
    var client = new Client();
    var args = {
        headers: {
            "Content-Type": "application/json",
            "x-ibm-client-id": common.getClientId(),
            "x-ibm-client-secret": common.getClientSecret()
        }
    };

    client.get(common.getBranchURL(), args, function (data, response) {
        user_params[sender] = [];
        user_params[sender].branches = [];

        var resultlength = data.length;
        if (resultlength > 4) {
            resultlength = 4;
        }

        var messageData = [];
        if (resultlength < 2) {
            var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + data[0].latitude + "," + data[0].longitude + "&zoom=15&markers=" + data[0].latitude + "," + data[0].longitude + "&keys=" + common.getGooleAPIKey();
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
                user_params[sender].branches[i] = {
                    "title": data[i].name,
                    "subtitle": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                    "buttons": [
                        {
                            "title": "View",
                            "type": "postback",
                            "payload": "VIEW_BRANCH_" + data[i].id
                        }
                    ]
                };
            }

            messageData = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "list",
                        "top_element_style": "compact",
                        "elements": user_params[sender].branches,
                        "buttons": [
                            {
                                "title": "View More",
                                "type": "postback",
                                "payload": "VIEW_MORE_BRANCHES_4"
                            }
                        ]
                    }
                }
            };
        }
        utils.sendMessage(sender, messageData);

    });
};


exports.search = function (sender) {
    var messages = [];

    messages.push({ text: "Copy that. Let's look for a Branch. 🔎" });
    messages.push({
        "text": "Can you send your current location or any location where you want to find the closest branch?"});
    messages.push({
        "text": "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal.",
        "quick_replies": [
            {
                "content_type": "location",
                "title": "Share Location"
            },
            {
                "content_type": "text",
                "title": "Not Now",
                "payload": "RESET"
            }
            //            {
            //                "content_type": "text",
            //                "title": "View all",
            //                "payload": "VIEW_ALL_BRANCH"
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

//find Branch by keywords
exports.findBranchByKeyword = function (sender, keyword) {

    var pattern = new RegExp(".*" + keyword + ".*", "ig");
    user_params[sender] = [];
    user_params[sender].keyword = keyword;
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: common.getToken() },
        method: 'POST',
        json: {
            recipient: { id: sender },
            message: { text: "Got the location. Let me look for nearby branches. 📡" }
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
                user_params[sender].distance.push({
                    "id": data[i].id,
                    "name": data[i].name,
                    "address": data[i].address.replace(/[&]nbsp[;]/gi, " "),
                    "latitude": data[i].latitude,
                    "longitude": data[i].longitude
                });
            }
        }


        if (user_params[sender].distance === null
            || user_params[sender].distance === undefined
            || user_params[sender].distance.length === 0) {
            var messages =
                {
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
                "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude + "&zoom=15&markers=" + user_params[sender].distance[i].latitude + "," + user_params[sender].distance[i].longitude + "&keys=" + common.getGooleAPIKey(),
                "buttons": [{
                    "title": "View Details",
                    "type": "postback",
                    "payload": "VIEW_BRANCH_" + user_params[sender].distance[i].id
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
                            "image_url": "https://maps.googleapis.com/maps/api/staticmap?size=764x400&center=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "&zoom=15&markers=" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude + "&keys=" + common.getGooleAPIKey(),
                            "buttons": [{
                                "type": "postback",
                                "title": "Get Directions",
                                "payload": "FIND_DIRECTIONS_" + user_params[sender].distance[0].latitude + "," + user_params[sender].distance[0].longitude
                            },
                            {
                                "type": "postback",
                                "title": "View Info",
                                "payload": "BRANCH_INFO_" + user_params[sender].distance[0].id
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
                        "buttons": [
                            {
                                "title": "View More",
                                "type": "postback",
                                "payload": "VIEW_MORE_BRANCH_4-" + keyword
                            }
                        ]
                    }
                },
                "quick_replies": common.commonQuickReplies()
            };

        }



        var messages = [];
        messages.push({ text: 'I have found ' + user_params[sender].distance.length + ' Branch locations.' });
        messages.push(messageData);
        utils.sendSeriesMessages(sender, messages);

    });
};

