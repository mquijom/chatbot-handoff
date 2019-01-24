var request = require("request");
var express = require("express");
var path = require("path");
var ai_router = express.Router();

ai_router.route('/response')
.post((req, res)=>{
    var query = req.body;
    query.lang = "en";
    request.post({
        url: common.getDialogflowUrl(),
        headers: {
            'Authorization': 'Bearer ' + common.getDialogflowToken()
        },
        json: query
    }, function (err, httpResponse, body) {
        res.json(body);
    });
})


module.exports = ai_router;

