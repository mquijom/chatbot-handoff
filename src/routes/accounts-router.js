var request = require("request");
var express = require("express");
var path = require("path");
var account_router = express.Router();

account_router.route("/authorization").post((req, res) => {
  var accountNumber = req.body.details.account_number;
  request.post({
    url: common.getAccountAuthorizationUrl(),
    headers: {
      "x-ibm-client-id": common.getClientId(),
      "x-ibm-client-secret": common.getClientSecret()
    },
    json: {
      accountNumber: accountNumber
    }
  }),
    function(err, httpResponse, body) {
      var log_data = req.body.log_details;
      log_data.params.push({
        api: "Debit Card Inquiry",
        end_point: common.getAccountAuthorizationUrl(),
        request: req.body.details,
        response: body
      });
    };
});

account_router.route("/authorization/verification").post((req, res) => {
  var code = req.body.details.code;
  var referenceId = req.body.details.referenceId;
  var accountNumber = req.body.details.accountNumber;
  request.post({
    url: common.getAccountAuthorizationVerificationUrl(),
    headers: {
      "x-ibm-client-id": common.getClientId(),
      "x-ibm-client-secret": common.getClientSecret()
    },
    json: {
      code: code,
      referenceId: referenceId
    }
  }),
    function(err, httpResponse, body) {
      var log_data = req.body.log_details;
      log_data.params.push({
        api: "Debit Card Inquiry",
        end_point: common.getAccountAuthorizationVerificationUrl(),
        request: req.body.details,
        response: body
      });
    };
});

module.exports = account_router;
