'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var path = require('path');

var app = express();

var utils = require('./utils/utils.js');
var common = require('./utils/constants.js');
var localData = require('./services/mock.js');

app.set('port', (process.env.PORT || 8080));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Process application/json
app.use(bodyParser.json());

// SETUP CORS
//#############################################################################
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});

//mongoose 
// =============================================================================
var mongoose = require('mongoose');
mongoose.connect(common.getMongoDBUrl(), (err) => {
    if (err) {
        console.log("######### cannot connect to DB: " + err);
    } else {
        console.log('##### CONNECTED #####');
    }
});

// Routers
app.use('/', require('./routes/view-router.js'));
app.use('/oauth', require('./routes/oauth-router.js'));
app.use('/api', require('./routes/api-router.js'));
app.use('/webhook', require('./routes/facebook-webhook.js'));
app.use('/setup', require('./routes/facebook-setup.js'));
app.use('/authorization', require('./routes/auth-router'));
app.use('/cards', require('./routes/auth-router'));
app.use('/callback', require('./routes/callback-router'));
app.use('/accounts', require('./routes/accounts-router'))
app.use('/token', require('./routes/token-router'))
app.use('/ai', require('./routes/ai-router'))

app.use('/public', express.static(path.join(__dirname, 'assets')));
app.use('/controller', express.static(__dirname + '/webviews/controller'));

app.get('/localData', function (req, res) {
    res.json(localData);
});

app.post('/logs', (req, res) => {
    utils.sendLogs(req.body);
    res.sendStatus(200);
});

// SERVER
// =============================================================================
app.listen(app.get('port'), function () {
    console.log('running on port', app.get('port'));
});