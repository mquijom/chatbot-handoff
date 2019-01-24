
var atmService = require('../services/atmService.js');
var branchService = require('../services/branchService.js');
var locationService = require('../services/locationService.js');
var utils = require('../utils/utils.js');

var params = {};

exports.processRequest = function (sender, locationCoordinates, senderLocation, attachment) {
    params[sender] = {};
    params[sender].module = senderLocation.action;
    params[sender].action = senderLocation.mode;
    params[sender].sender = sender;

    function sendLogs(log, sk) {
        var details = [];
        details.push(params[sender]);
        details.push(log);
        if (sk != null) {
            utils.sendLogs({
                logtime: new Date(),
                user: sender,
                module: params[sender].module,
                action: params[sender].action,
                skill: sk,
                params: details
            });
        } else {
            utils.sendLogs({
                logtime: new Date(),
                user: sender,
                module: params[sender].module,
                action: params[sender].action,
                params: details
            });
        }
    }
    if (senderLocation && senderLocation.mode === 'SEARCH_ATM') {
        atmService.findNearByATMs(sender, locationCoordinates, function (resp) {
            var skill = {
                name: "FIND_AN_ATM",
                mode: "b"
            };
            sendLogs(resp, skill);
        });
    } else if (senderLocation && senderLocation.mode === 'SEARCH_BRANCH') {
        branchService.findNearByBranches(sender, locationCoordinates, function (resp1) {
            var skill = {
                name: "FIND_A_BRANCH",
                mode: "b"
            };
            sendLogs(resp1, skill);
        });
    } else if (senderLocation && senderLocation.mode === 'FIND_DIRECTIONS') {
        var coordinates = [];
        coordinates[0] = locationCoordinates.lat + "," + locationCoordinates.long;
        coordinates[1] = senderLocation.location;
        locationService.getDirections(sender, coordinates, function (resp2) {
            sendLogs(resp2, null);
        });
    }

    return params[sender];

};