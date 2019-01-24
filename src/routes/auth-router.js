var request = require("request");
var express = require("express");
var path = require("path");
var auth_router = express.Router();

var BlockCardNumberModel = require('../models/BlockCardNumberModel.js');

auth_router.route('/')
.post((req, res)=>{
    var cc_number = req.body.details.cardNumber;
    if (!attempt_count[cc_number]) {
        attempt_count[cc_number] = {};
        attempt_count[cc_number].attempts = 0;
        attempt_count[cc_number].data = [];
    }
    //call ubp api
    console.log("CARD ACT req:::" + JSON.stringify(req.body));
    checkIfBlock(cc_number, (cc) => {
        if (cc.is_block) { // 3 or more attempts
            var log_data = req.body.log_details;
            log_data.params.push({
                attempt: attempt_count[cc_number],
                request: req.body.details
            });
            utils.sendLogs(log_data);
            res.json({
                errorCode: '9005',
                message: 'You have reached maximum failed attempts. Please try to contact our Customer Service Hotline @ +632 841-8600.'
            });
        } else {
            request.post({
                url: common.getAuthUrl(),
                headers: {
                    'x-ibm-client-id': common.getClientId(),
                    'x-ibm-client-secret': common.getClientSecret()
                },
                json: {
                    cardNumber: cc_number
                }
            }, function (err, httpResponse, body) {
                var rec = body;
                console.log("### AUTH RESPONSE: " + JSON.stringify(rec));
                var log_data = req.body.log_details;
                log_data.params.push({
                    api: 'Credit Card Inquiry',
                    end_point: common.getAuthUrl(),
                    request: req.body.details,
                    response: rec
                });
                utils.sendLogs(log_data);
                if (rec.httpCode) {
                    res.json({
                        errorCode: "0001",
                        message: rec.httpMessage + " " + rec.moreInformation
                    });
                } else if (rec.errors) {
                    var errMsg = '';
                    var errCode = '';
                    rec.errors.forEach((er) => {
                        if (er.message === "Your request is incomplete and missing the mandatory parameter: number") {
                            errCode = '0012';
                        } else {
                            errMsg = errMsg + er.message + '\n';
                        }
                    });
                    if (errCode !== '') {
                        res.json({
                            errorCode: errCode,
                            message: "Your request is incomplete and missing the mandatory parameter: number"
                        });
                    } else {
                        res.json({
                            errorCode: "0001",
                            message: errMsg
                        });
                    }
                } else if (err && err !== null) {
                    res.json({
                        errorCode: "0011",
                        message: err
                    });
                } else {
                    res.json(rec);
                }
            });
        }
    });
})

auth_router.route("/verification")
.post((req, res)=>{
    var code = req.body.details.code;
    var referenceId = req.body.details.referenceId;
    var cc_number = req.body.details.card_number;
    checkIfBlock(cc_number, (cc) => {
        if (cc.is_block) { // 3 or more attempts
            var log_data = req.body.log_details;
            log_data.params.push({
                attempt: attempt_count[cc_number],
                request: req.body.details
            });
            utils.sendLogs(log_data);
            res.json({
                errorCode: '9006',
                message: 'You have reached maximum failed attempts. Please try to contact our Customer Service Hotline @ +632 841-8600.'
            });
        } else {
            request.post({
                url: common.getVerifyAuthUrl(),
                headers: {
                    'x-ibm-client-id': common.getClientId(),
                    'x-ibm-client-secret': common.getClientSecret()
                },
                json: {
                    code: code,
                    referenceId: referenceId
                }
            }, function (err, httpResponse, body) {
                var log_data = req.body.log_details;
                log_data.params.push({
                    api: 'Credit Card Inquiry',
                    end_point: common.getVerifyAuthUrl(),
                    request: req.body.details,
                    response: body
                });
                utils.sendLogs(log_data);
                console.log("###### resp: " + JSON.stringify(body));
                if (body.errors) {
                    var block_message = card_attempt(cc_number, req.body.details, log_data.user)
                    res.json({
                        errorCode: '9003',
                        message: body.errors[0].message + ' ' + block_message,
                        attempts: attempt_count[cc_number].attempts
                    });
                } else {
                    attempt_count[cc_number] = {};
                    attempt_count[cc_number].attempts = 0;
                    attempt_count[cc_number].data = [];
                    res.json(body);
                }
            });
        }
    });
})

function card_attempt(cc_number, req, user_id) {
    attempt_count[cc_number].attempts += 1;
    attempt_count[cc_number].data.push({
        user: user_id,
        date: new Date(),
        request: req
    });
    console.log('attempts: ' + JSON.stringify(attempt_count[cc_number]));
    var message = "";
    if (attempt_count[cc_number].attempts >= 3) {
        attempt_count[cc_number].card_number = cc_number;
        attempt_count[cc_number].skill = 'Credit Card Balance';
        attempt_count[cc_number].is_block = true;

        var block = new BlockCardNumberModel();
        block.details = attempt_count[cc_number];
        block.save();
        console.log("Card Number has been block.");
        message = "You have reached maximum failed attempts. Please try to contact our Customer Service Hotline @ +632 841-8600.";
        attempt_count[cc_number] = {};
        attempt_count[cc_number].attempts = 0;
        attempt_count[cc_number].data = [];
    } else {
        message = 'You only have ' + (3 - attempt_count[cc_number].attempts) + ' attempt/s';
    }
    return message;
}

function checkIfBlock(cc_number, callback) {
    var card_masked = 'XXXX-XXXX-XXXX-' + cc_number.substring(cc_number.length - 4, cc_number.length);
    BlockCardNumberModel.find({ 'card_masked': card_masked }, (err, cards) => {
        var isBlock = false;
        console.log('############# cards: ' + JSON.stringify(cards))
        if (cards && cards.length > 0) {
            var CardThrow = {};
            try {
                cards.forEach((card) => {
                    if (card.details.card_number == cc_number) {
                        console.log('details: ' + JSON.stringify(card.details));
                        isBlock = card.details.is_block;
                        throw CardThrow;
                    }
                });
            } catch (error) {
                if (error !== CardThrow) console.log(error);
            }
        }
        callback({ is_block: isBlock });
    });
}

module.exports = auth_router;


