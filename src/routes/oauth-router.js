'use strict'

var request = require('request');
var express = require('express');
var path = require('path');
var oAuthRouter = express.Router();

var common = require('../utils/constants.js');
var utils = require('../utils/utils.js');

var temp_client_id = "b9f43652-f18d-4dbc-90bb-96628f6fb62f";
var billers = {};

oAuthRouter.route('/')
    .get((req, res) => {
        console.log('code: ' + req.query.code);
        // let options = {
        //     url: common.getOAuth2Url() + '/token',
        //     headers: {
        //         'content-type': 'application/x-www-form-urlencoded',
        //         'accept': 'text/html'
        //     },
        //     method: 'POST',
        //     form: {
        //         client_id: common.getClientId(),
        //         code: req.query.code,
        //         redirect_uri: common.getHomeUrl() + '/oauth',
        //         grant_type: 'authorization_code'
        //     }
        // };
        // request(options, function (err, response, body) {
        //     console.log(JSON.stringify(body));
        //     if (err) {
        //         res.sendStatus(403);
        //     } else if(body.errors || body.httpCode) {
        //         res.json(body);
        //     } else {
        //         var data = {};
        //         try {
        //             data = JSON.parse(body);
        //         } catch (error) {
        //             data = body;
        //         }
        //         console.log('accesstoken: ' + data.access_token);

        //         req.query.code = data.access_token;
        //         console.log('accesstoken replace code: ' + req.query.code);
        res.sendFile(path.resolve(__dirname + '/../webviews/oauth_success.html'));
        //     }
        // });
    });

oAuthRouter.route('/login')
    .get((req, res) => {
        var query = '/authorize?client_id=' + common.getClientId() +
            '&redirect_uri=' + common.getHomeUrl() + '/oauth' +
            '&scope=' + req.query.scope + '&response_type=code';

        var redirect_url = common.getOAuth2Url() + query;
        res.json({
            url: redirect_url
        });
    })
    .post((req, res) => {
        var query = '/authorize?client_id=' + common.getClientId() +
            '&redirect_uri=' + common.getHomeUrl() + '/oauth' +
            '&scope=' + req.body.details.scope + '&response_type=code';
        var redirect_url = common.getOAuth2Url() + query;
        var log_data = req.body.log_details;
        log_data.params.push({
            api: 'oAuth2',
            end_point: redirect_url
        });
        utils.sendLogs(log_data);
        res.json({
            url: redirect_url
        });
    });

oAuthRouter.route('/token')
    .get((req, res) => {
        let options = {
            url: common.getOAuth2Url() + '/token',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'accept': 'text/html'
            },
            method: 'POST',
            form: {
                client_id: common.getClientId(),
                code: req.query.code,
                redirect_uri: common.getHomeUrl() + '/oauth',
                grant_type: 'authorization_code'
            }
        };
        request(options, function (err, response, body) {
            JSON.stringify('OAUTH TOKEN: ' + JSON.stringify(body));
            if (err) {
                console.log('Error', err);
                res.json({
                    errorCode: "0001",
                    message: err
                });
            } else {
                var data = {};
                try {
                    data = JSON.parse(body);
                } catch (error) {
                    data = body;
                }
                if (data.errors) {
                    res.json({
                        errorCode: "0002",
                        message: data.errors[0].message
                    });
                } else {
                    res.json(data);
                }
            }
        });
    })
    .post((req, res) => {
        let options = {
            url: common.getOAuth2Url() + '/token',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'accept': 'text/html'
            },
            method: 'POST',
            form: {
                client_id: common.getClientId(),
                code: req.body.details.code,
                redirect_uri: common.getHomeUrl() + '/oauth',
                grant_type: 'authorization_code'
            }
        };
        request(options, function (err, response, body) {
            var log_data = req.body.log_details;
            log_data.params.push({
                api: 'OAuth',
                end_point: common.getOAuth2Url() + '/token',
                request: req.body.details,
                response: JSON.parse(body)
            });
            utils.sendLogs(log_data);
            JSON.stringify('OAUTH TOKEN: ' + JSON.stringify(body));
            if (err) {
                console.log('Error', err);
                res.json({
                    errorCode: "0001",
                    message: err
                });
            } else {
                var data = {};
                try {
                    data = JSON.parse(body);
                } catch (error) {
                    data = body;
                }
                if (data.errors) {
                    res.json({
                        errorCode: "0002",
                        message: data.errors[0].message
                    });
                } else {
                    res.json(data);
                }
            }
        });
    });

module.exports = oAuthRouter;