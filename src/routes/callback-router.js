var request = require("request");
var express = require("express");
var path = require("path");
var callback_router = express.Router();

var balanceInquiryService = require('../services/balanceInquiryService.js');
var cardActivationService = require('../services/cardActivation.js');
var gsisActivationService = require('../services/gsisActivation.js');
var applicationService = require('../services/applicationService.js');
var payBillsService = require('../services/payBillsService.js');

callback_router.route('/')
.post((req, res)=>{
    var args = req.body;
    if (args.method.includes('BALANCE')) {
        balanceInquiryService.displayCreditCards(args.sender, args);
    } else if (args.method.includes('CARD_ACTIVATION')) {
        cardActivationService.successActivationRequest(args);
    } else if (args.method.includes('GSIS_ACTIVATION')) {
        gsisActivationService.successActivationRequest(args.sender);
    } else if (args.method.includes('APPLICATION')) {
        applicationService.processRequest(args);
    } else if (args.method.includes('PAY_BILLS')) {
        console.log('test');
        payBillsService.processRequest(args);
    }

    res.sendStatus(200);
})

module.exports = callback_router;
