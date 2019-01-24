var request = require("request");
var express = require("express");
var path = require("path");
var token_router = express.Router();

var CryptoJS = require("crypto-js");

token_router.route('/redirect')
.post((req, res)=>{
    console.log(JSON.stringify(req.body));
    var encryptedParams = String(encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify(req.body.params), common.getSecretToken())));
    var url = req.body.url + "?token=" + encryptedParams;
    res.json(url);
})

token_router.route('/retrieve')
.post((req, res)=>{
    try {
        var decryptedParams = CryptoJS.AES.decrypt(decodeURIComponent(req.body.code), common.getSecretToken()).toString(CryptoJS.enc.Utf8);
        console.log(JSON.stringify(decryptedParams));
        res.json(JSON.parse(decryptedParams));
    } catch (error) {
        console.log('ERROR TOKEN: ' + error);
        res.json({
            errorCode: '11001',
            message: 'Invalid Token'
        })
    }
})


module.exports= token_router;

