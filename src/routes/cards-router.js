var request = require("request");
var express = require("express");
var path = require("path");
var card_router = express.Router();

card_router.route('/details')
.post((req, res)=>{
    request.get({
        url: common.getCardDetailsUrl(),
        headers: {
            'x-ibm-client-id': common.getClientId(),
            'x-ibm-client-secret': common.getClientSecret(),
            'Authorization': 'Bearer ' + req.body.details.access_token
        }
    }, function (err, httpResponse, body) {
        var rec = JSON.parse(body);
        var log_data = req.body.log_details;
        log_data.params.push({
            api: 'Credit Card Inquiry',
            end_point: common.getCardDetailsUrl(),
            request: req.body.details,
            response: rec
        });
        utils.sendLogs(log_data);
        if (rec.errors || err !== null) {
            console.log("###### cardDetails err: " + err);
            console.log("### cardDetails response err: " + JSON.stringify(rec))
            res.json({
                errorCode: "2000",
                message: err
            });
        } else {
            console.log("###### resp: " + JSON.stringify(body));
            res.json(JSON.parse(body));
        }
    });
})

card_router.route('/balances')
.post((req,res)=>{
    request.get({
        url: common.getCardBalanceUrl(),
        headers: {
            'x-ibm-client-id': common.getClientId(),
            'x-ibm-client-secret': common.getClientSecret(),
            'Authorization': 'Bearer ' + req.body.details.access_token
        }
    }, function (err, httpResponse, body) {
        console.log("### BALANCES response: " + err + ":::" + JSON.stringify(body));
        var rec = JSON.parse(body);
        var log_data = req.body.log_details;
        log_data.params.push({
            api: 'Credit Card Inquiry',
            end_point: common.getCardBalanceUrl(),
            request: req.body.details,
            response: rec
        });
        utils.sendLogs(log_data);
        if (rec.httpCode !== undefined || (err && err !== null)) {
            console.log("### BALANCES err: " + err)
            res.json({
                errorCode: "2001",
                message: rec.errors[0].message
            });
        } else {
            res.json(rec);
        }
    });
})


card_router.route('/unbilled')
.post((req, res)=>{
    request.get({
        url: common.getCardUnbilledUrl(),
        headers: {
            'x-ibm-client-id': common.getClientId(),
            'x-ibm-client-secret': common.getClientSecret(),
            'Authorization': 'Bearer ' + req.body.details.access_token
        }
    }, function (err, httpResponse, body) {
        console.log("### UNBILLED response: " + err + ":::" + JSON.stringify(body));
        var rec = JSON.parse(body);
        var log_data = req.body.log_details;
        log_data.params.push({
            api: 'Credit Card Inquiry',
            end_point: common.getCardUnbilledUrl(),
            request: req.body.details,
            response: rec
        });
        utils.sendLogs(log_data);
        if (rec.errors || err !== null) {
            console.log("### UNBILLED err: " + err)
            console.log("### UNBILLED response err: " + JSON.stringify(rec))
            res.json({
                errorCode: "4001",
                message: "System Maintenance"
            });
        } else if (rec.httpCode !== undefined) {
            res.json({
                errorCode: rec.httpCode,
                message: rec.httpMessage + " ::: " + rec.moreInformation
            });
        } else {
            res.json(rec);
        }
    });
})


card_router.route('/statement_header')
.post((req, res)=>{
    request.get({
        url: common.getCardStatementSummaryUrl(),
        headers: {
            'x-ibm-client-id': common.getClientId(),
            'x-ibm-client-secret': common.getClientSecret(),
            'Authorization': 'Bearer ' + req.body.details.access_token
        }
    }, function (err, httpResponse, body) {
        console.log("### STATEMENT HEADER response: " + err + ":::" + JSON.stringify(body));
        var rec = JSON.parse(body);
        var log_data = req.body.log_details;
        log_data.params.push({
            api: 'Credit Card Inquiry',
            end_point: common.getCardStatementSummaryUrl(),
            request: req.body.details,
            response: rec
        });
        utils.sendLogs(log_data);
        if (rec.errors || err || err !== null) {
            console.log("### STATEMENT HEADER err: " + JSON.stringify(err))
            console.log("### STATEMENT HEADER response err: " + JSON.stringify(rec))
            res.json({
                errorCode: "5001",
                message: "System Maintenance"
            });
        } else {
            res.json(rec);
        }
    });
})


card_router.route('/statement_transactions')
.post((req, res)=>{
    request.get({
        url: common.getCardStatementTransUrl(),
        headers: {
            'x-ibm-client-id': common.getClientId(),
            'x-ibm-client-secret': common.getClientSecret(),
            'Authorization': 'Bearer ' + req.body.details.access_token
        }
    }, function (err, httpResponse, body) {
        console.log("### STATEMENT TRANS response: " + err + ":::" + JSON.stringify(body));
        var rec = JSON.parse(body);
        var log_data = req.body.log_details;
        log_data.params.push({
            api: 'Credit Card Inquiry',
            end_point: common.getCardStatementTransUrl(),
            request: req.body.details,
            response: rec
        });
        utils.sendLogs(log_data);
        if (rec.errors || err !== null) {
            console.log("### ValidateCC err: " + err)
            console.log("### ValidateCC response err: " + JSON.stringify(rec))
            res.json({
                errorCode: "5002",
                message: "System Maintenance"
            });
        } else {
            res.json(rec);
        }
    });
})

module.exports = card_router;