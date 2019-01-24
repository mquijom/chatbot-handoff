'use strict'

var request = require('request');
var express = require('express');
var path = require('path');
var cardActivationRouter = express.Router();

var common = require('../utils/constants.js');
var utils = require('../utils/utils.js');

// var temp_id = "162c772e-7742-48e3-a302-f795f62b4be8";
// var temp_secret = "I6qN3hN8oN5yW3oR4sY6uV5yX1aB7pL4gK6bY7aW6mB0rB5iR4";
var prod_client_id = 'a16641eb-96b5-4f23-b5da-c45af88a883d';
var prod_client_secret = 'P5oA7vA8nI2vX5eW5pC8nE6cP6pK5aU8tO7jM5aY1qK4uB6vH1';
var attempt_count = {};

var BlockCardNumberModel = require('../models/BlockCardNumberModel.js');

cardActivationRouter.route("/")

    // verify details
    .post((req, res) => {
        var cc_number = req.body.details.card_details.card.number;
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
                    url: common.getCardActivationUrl(),
                    headers: {
                        'x-ibm-client-id': common.getClientId(),
                        'x-ibm-client-secret': common.getClientSecret()
                    },
                    json: req.body.details.card_details
                }, function (err, httpResponse, body) {
                    console.log("###### resp: " + JSON.stringify(body));
                    var log_data = req.body.log_details;
                    log_data.params.push({
                        api: 'Card Activation',
                        end_point: common.getCardActivationUrl(),
                        request: req.body.details,
                        response: body,
                        attempts: parseInt(attempt_count[cc_number].attempts) + 1
                    });
                    utils.sendLogs(log_data);
                    if (body.errors || !body.referenceId) {
                        var block_message = card_attempt(cc_number, req.body.details, log_data.user, 'Credit Card Activation');
                        console.log(block_message);
                        res.json({
                            errorCode: '9001',
                            message: body.errors[0].message + ' ' + block_message,
                            attempts: attempt_count[cc_number].attempts
                        });
                        // });
                    } else if (err && err !== null) {
                        res.json({
                            errorCode: '9002',
                            message: 'System Maintenance'
                        });
                    } else {
                        res.json(body);
                    }
                });
            }
        });
    });

cardActivationRouter.route("/otp")
    // verify otp
    .post((req, res) => {
        //call ubp api
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
                    url: common.getActivationOTPUrl(),
                    headers: {
                        'x-ibm-client-id': common.getClientId(),
                        'x-ibm-client-secret': common.getClientSecret()
                    },
                    json: req.body.details.otp_details
                }, function (err, httpResponse, body) {
                    console.log("###### resp: " + JSON.stringify(body));
                    var log_data = req.body.log_details;
                    log_data.params.push({
                        api: 'Card Activation',
                        end_point: common.getActivationOTPUrl(),
                        request: req.body.details,
                        response: body,
                        attempts: parseInt(attempt_count[cc_number].attempts) + 1
                    });
                    utils.sendLogs(log_data);
                    if (body.errors) {
                        var block_message = card_attempt(cc_number, req.body.details, log_data.user, 'Credit Card Activation')
                        res.json({
                            errorCode: '9003',
                            message: body.errors[0].message + ' ' + block_message,
                            attempts: attempt_count[cc_number].attempts
                        });
                    } else if (err && err !== null) {
                        res.json({
                            errorCode: '9004',
                            message: 'System Maintenance'
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
    });

function card_attempt(cc_number, req, user_id, skill) {
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
        attempt_count[cc_number].skill = skill;
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


module.exports = cardActivationRouter;