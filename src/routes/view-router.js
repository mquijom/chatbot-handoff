'use strict'

var request = require('request');
var express = require('express');
var path = require('path');
var router = express.Router();

var common = require('../utils/constants.js');
var utils = require('../utils/utils.js');


router.route('/')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/release_version.html'));
    });

router.route('/version')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/release_version.html'));
    });

router.route('/sample')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/sample.html'));
    });

router.route('/privacypolicy')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../pages/privacypolicy.htm'));
    });

router.route('/test')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/test.html'));
    });

router.route('/homeloan')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/homeloan.html'));
    });

router.route('/balance-inquiry')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/balance-inquiry.html'));
    });

router.route('/balance')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/balance.html'));
    });

router.route('/balance-inq')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/balance-inq.html'));
    });

router.route('/unbilled-trans')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/unbilled-trans.html'));
    });

router.route('/statement')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/statement.html'));
    });

router.route('/card-activation')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/card-activation.html'));
    });

router.route('/autoloan-car-specific')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/autoloan-car-specific.html'));
    });

router.route('/autoloan-budget-specific')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/autoloan-budget-specific.html'));
    });

router.route('/autoloan-capacity-specific')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/autoloan-capacity-specific.html'));
    });

router.route('/acceptable-ids')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/acceptable-ids.html'));
    });

router.route('/location')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/location.html'));
    });

router.route('/ubp_logo')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/public/ubp_logo.png'));
    });

router.route('/google9ac3292b99482b08.html')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/google9ac3292b99482b08.html'));
    });

router.route('/login')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/login.html'));
    });

router.route('/login2')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/login-cc.html'));
    });

router.route('/login-casa')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/login-casa.html'));
    });

router.route('/application')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/application-cc.html'));
    });

router.route('/application/status')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/application-status.html'));
    });

router.route('/transactions-cc')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/transaction-cc.html'));
    });

router.route('/termsandconditions')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/termsandconditions.html'));
    });

router.route('/login2UI')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/login2UI.html'));
    });

router.route('/err-page')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/err-page.html'));
    });

router.route('/system-maintenance')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/system-maintenance.html'));
    });

router.route('/billers')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/billers.html'));
    });

router.route('/casa-transactions')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/casa-transactions.html'));
    });

router.route('/gsis-activation')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/gsis-card.html'));
    });

router.route('/checkwriter')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/checkwriter.html'));
    });

router.route('/updatecontacts')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/updatecontacts.html'));
    });

router.route('/recaptcha')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/recaptcha.html'));
    });

router.route('/test')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/test.html'));
    });

router.route('/rating')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/rating.html'));
    });

router.route('/loginDispute')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/loginDispute.html'));
    });

router.route('/atmDispute')
    .get((req, res) => {
        res.sendFile(path.resolve(__dirname + '/../webviews/atmDispute.html'));
    });

module.exports = router;