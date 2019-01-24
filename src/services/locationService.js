var request = require('request');
var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');

var async = require('async');

var user_params = {};

exports.getDirections = function (sender, coordinates, mode, address, callback) {
    var url = 'http://maps.googleapis.com/maps/api/directions/json?origin=' + coordinates[0] + '&destination=' + coordinates[1] + '&sensor=false';
    user_params[sender] = {};
    user_params[sender].url = url;
    user_params[sender].coordinates = coordinates;
    user_params[sender].mode = mode;
    user_params[sender].address = address;
    request({
            url: url,
            method: 'GET'
        },
        function (error, response, body) {
            var directions = {};
            try {
                directions = JSON.parse(body);
            } catch (error) {
                directions = body;
            }
            var messages = [];
            if (error || response.body.error || directions.error_message) {
                console.log('Error: ', error);
                console.log('Error Response: ', response.body.error);
                console.log('Error Message: ', body.error_message);
                messages.push({
                    text: "Sorry we can't find your route",
                    quick_replies: common.commonQuickReplies()
                });

                utils.sendSeriesMessages(sender, messages);
                callback(user_params[sender]);
            } else {
                user_params[sender].location = directions;
                var step_by_step = [];

                if (mode === "ATM") {
                    messages.push({
                        text: "This ATM is at " + address + "."
                    });
                } else if (mode === "BRANCH") {
                    messages.push({
                        text: "This branch is at " + address + "."
                    });
                }
                //
                if (directions === undefined || directions === null ||
                    directions.routes[0] === undefined || directions.routes[0] === null |
                    directions.routes[0].legs[0] === undefined || directions.routes[0].legs[0] === null) {

                    var messages = [];
                    messages.push({
                        text: "Location is too far."
                    });
                    messages.push({
                        text: "Is there anything else I can help you with?",
                        quick_replies: common.commonQuickReplies()
                    });

                    utils.sendSeriesMessages(sender, messages);
                    callback(user_params[sender]);
                }

                //calculate distance
                utils.typing(sender);
                var from = coordinates[0].split(",");
                var to = coordinates[1].split(",");
                var dist = utils.distance(from[0], from[1], to[0], to[1], 'K');
                user_params[sender].distance = dist;
                var zoom = 15;
                if (dist < 1) {
                    zoom = 17;
                } else if (dist >= 5 && dist < 7) {
                    zoom = 14;
                } else if (dist >= 7 && dist < 10) {
                    zoom = 13;
                } else if (dist >= 10 && dist < 20) {
                    zoom = 12;
                } else if (dist >= 20 && dist < 40) {
                    zoom = 11;
                } else if (dist >= 40) {
                    zoom = 10;
                }

                var locationMap = "https://maps.googleapis.com/maps/api/staticmap?size=640x640&scale=2&markers=color:orange%7C" + coordinates[0] + "&markers=icon:https://goo.gl/N3Jb67%7C" + coordinates[1] +
                    "&path=enc%3A" + directions.routes[0].overview_polyline.points +
                    "&keys=" + common.getGooleAPIKey();
                user_params[sender].locationMap = locationMap;
                console.log("########## locationMap: " + locationMap);
                messages.push({
                    "attachment": {
                        "type": "image",
                        "payload": {
                            "url": locationMap
                        }
                    }
                });

                for (var i = 0; i < directions.routes[0].legs[0].steps.length - 1; i++) {
                    var format = directions.routes[0].legs[0].steps[i].html_instructions;
                    var symbol = "";
                    var direction = format.toUpperCase();
                    if (direction.indexOf('LEFT') !== -1) {
                        symbol = "⬅";
                    } else if (direction.indexOf('RIGHT') !== -1) {
                        symbol = "➡";
                    } else if (direction.indexOf('NORTHWEST') !== -1) {
                        symbol = "↖";
                    } else if (direction.indexOf('NORTHEAST') !== -1) {
                        symbol = "↗";
                    } else if (direction.indexOf('SOUTHWEST') !== -1) {
                        symbol = "↙";
                    } else if (direction.indexOf('SOUTHEAST') !== -1) {
                        symbol = "↘";
                    } else if (direction.indexOf('ROUNDABOUT') !== -1) {
                        symbol = "🔄";
                    } else if (direction.indexOf('RAMP') !== -1) {
                        symbol = "🔼";
                    } else if (direction.indexOf('CONTINUE') !== -1) {
                        symbol = "⬆";
                    } else {
                        symbol = "⚠";
                    }
                    console.log("distance: " + symbol + " " + directions.routes[0].legs[0].steps[i].distance.text + "-" + format.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/<div style=\"font-size:0.9em\">/g, " (").replace(/<\/div>/g, ")"));
                    step_by_step.push(symbol + " " + format.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/<div style=\"font-size:0.9em\">/g, " (").replace(/<\/div>/g, ")"));
                    messages.push({
                        text: symbol + " " + format.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/<div style=\"font-size:0.9em\">/g, " (").replace(/<\/div>/g, ")")
                    });
                }

                var last_step = directions.routes[0].legs[0].steps[directions.routes[0].legs[0].steps.length - 1].html_instructions;
                var last_step_formatted = "🏁 " + last_step.replace(/<b>/g, "").replace(/<\/b>/g, "").replace(/<div style=\"font-size:0.9em\">/g, " (").replace(/<\/div>/g, ")");

                messages.push({
                    "text": last_step_formatted
                });

                if (mode === "ATM") {
                    messages.push({
                        text: "I hope this helps you find our nearest ATM."
                    });
                } else if (mode === "BRANCH") {
                    messages.push({
                        text: "I hope this helps you find our nearest branch."
                    });
                }

                messages.push({
                    text: "How else can I help you today?",
                    quick_replies: common.commonQuickReplies()
                });

                utils.sendSeriesMessages(sender, messages);
                callback(user_params[sender]);
            }
        });
};