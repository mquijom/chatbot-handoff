"use strict";

var request = require("request");
var express = require("express");
var path = require("path");
var apiRouter = express.Router();

var common = require("../utils/constants.js");
var utils = require("../utils/utils.js");

var CryptoJS = require("crypto-js");

// session vars
var attempt_cc_activation = {};

// Models
var BlockCardNumberModel = require("../models/BlockCardNumberModel.js");
var UserModel = require("../models/UserModel.js");
// var AccountsModel = require("../models/AccountsModel.js");
// var TransactionModel = require("../models/TransactionModel.js");
var computeAutoLoanService = require('../services/loanService.js');
var autoLoanService = require('../services/autoLoanService.js');
var homeLoanService = require('../services/homeLoanService.js');

/*
#####################################
##############  APIs  ###############
#####################################
*/

// Credit Card Activation
apiRouter
  .route("/card/activation")
  // verify details
  .post((req, res) => {
    var cc_number = req.body.details.card_details.card.number;
    if (!attempt_cc_activation[cc_number]) {
      attempt_cc_activation[cc_number] = {};
      attempt_cc_activation[cc_number].attempts = 0;
      attempt_cc_activation[cc_number].data = [];
    }
    //call ubp api
    console.log("CARD ACT req:::" + JSON.stringify(req.body));
    checkIfBlock(cc_number, cc => {
      if (cc.is_block) {
        // 3 or more attempts
        var log_data = req.body.log_details;
        log_data.params.push({
          attempt: attempt_cc_activation[cc_number],
          request: req.body.details
        });
        utils.sendLogs(log_data);
        res.json({
          errorCode: "9005",
          message:
            "You have reached maximum failed attempts. Please try to contact our Customer Service Hotline @ +632 841-8600."
        });
      } else {
        request.post(
          {
            url: common.getCardActivationUrl(),
            headers: {
              "x-ibm-client-id": common.getClientId(),
              "x-ibm-client-secret": common.getClientSecret()
            },
            json: req.body.details.card_details
          },
          function(err, httpResponse, body) {
            console.log("###### resp: " + JSON.stringify(body));
            var log_data = req.body.log_details;
            log_data.params.push({
              api: "Card Activation",
              end_point: common.getCardActivationUrl(),
              request: req.body.details,
              response: body,
              attempts: parseInt(attempt_cc_activation[cc_number].attempts) + 1
            });
            utils.sendLogs(log_data);
            if (body.errors || !body.referenceId) {
              var block_message = card_attempt(
                cc_number,
                req.body.details,
                log_data.user,
                "Credit Card Activation"
              );
              console.log(block_message);
              res.json({
                errorCode: "9001",
                message: body.errors[0].message + " " + block_message,
                attempts: attempt_cc_activation[cc_number].attempts
              });
              // });
            } else if (err && err !== null) {
              res.json({
                errorCode: "9002",
                message: "System Maintenance"
              });
            } else {
              res.json(body);
            }
          }
        );
      }
    });
  });

apiRouter
  .route("/card/activation/otp")
  // verify otp
  .post((req, res) => {
    //call ubp api
    var cc_number = req.body.details.card_number;
    checkIfBlock(cc_number, cc => {
      if (cc.is_block) {
        // 3 or more attempts
        var log_data = req.body.log_details;
        log_data.params.push({
          attempt: attempt_cc_activation[cc_number],
          request: req.body.details
        });
        utils.sendLogs(log_data);
        res.json({
          errorCode: "9006",
          message:
            "You have reached maximum failed attempts. Please try to contact our Customer Service Hotline @ +632 841-8600."
        });
      } else {
        request.post(
          {
            url: common.getActivationOTPUrl(),
            headers: {
              "x-ibm-client-id": common.getClientId(),
              "x-ibm-client-secret": common.getClientSecret()
            },
            json: req.body.details.otp_details
          },
          function(err, httpResponse, body) {
            console.log("###### resp: " + JSON.stringify(body));
            var log_data = req.body.log_details;
            log_data.params.push({
              api: "Card Activation",
              end_point: common.getActivationOTPUrl(),
              request: req.body.details,
              response: body,
              attempts: parseInt(attempt_cc_activation[cc_number].attempts) + 1
            });
            utils.sendLogs(log_data);
            if (body.errors) {
              var block_message = card_attempt(
                cc_number,
                req.body.details,
                log_data.user,
                "Credit Card Activation"
              );
              res.json({
                errorCode: "9003",
                message: body.errors[0].message + " " + block_message,
                attempts: attempt_cc_activation[cc_number].attempts
              });
            } else if (err && err !== null) {
              res.json({
                errorCode: "9004",
                message: "System Maintenance"
              });
            } else {
              attempt_cc_activation[cc_number] = {};
              attempt_cc_activation[cc_number].attempts = 0;
              attempt_cc_activation[cc_number].data = [];
              res.json(body);
            }
          }
        );
      }
    });
  });

// Pay Bills
apiRouter
  .route("/billers")
  .get((req, res) => {
    request.get(
      {
        url: common.getBillersUrl(),
        headers: {
          accept: "application/json",
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret(),
          "x-partner-id": common.getClientPartnerID()
        }
      },
      function(err, httpResponse, body) {
        var rec = JSON.parse(body);
        res.json(rec);
      }
    );
  })
  .post((req, res) => {
    request.get(
      {
        url: common.getBillersUrl(),
        headers: {
          accept: "application/json",
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret(),
          "x-partner-id": common.getClientPartnerID()
        }
      },
      function(err, httpResponse, body) {
        var rec = JSON.parse(body);
        var log_data = req.body.log_details;
        log_data.params.push({
          api: "Biller Information",
          end_point: common.getBillersUrl(),
          request: {},
          response: rec
        });
        utils.sendLogs(log_data);
        res.json(rec);
      }
    );
  });

apiRouter
  .route("/billers/reference")
  .get((req, res) => {
    request.get(
      {
        url: common
          .getBillerReferencesUrl()
          .replace("{id}", req.query.biller_id),
        headers: {
          accept: "application/json",
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret(),
          "x-partner-id": common.getClientPartnerID()
        }
      },
      function(err, httpResponse, body) {
        var rec = JSON.parse(body);
        console.log(JSON.stringify(body));
        res.json(rec);
      }
    );
  })
  .post((req, res) => {
    request.get(
      {
        url: common
          .getBillerReferencesUrl()
          .replace("{id}", req.body.details.biller_id),
        headers: {
          accept: "application/json",
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret(),
          "x-partner-id": common.getClientPartnerID()
        }
      },
      function(err, httpResponse, body) {
        var rec = JSON.parse(body);
        var log_data = req.body.log_details;
        log_data.params.push({
          api: "Biller Information",
          end_point: common
            .getBillerReferencesUrl()
            .replace("{id}", req.body.details.biller_id),
          request: req.body.details,
          response: rec
        });
        utils.sendLogs(log_data);
        res.json(rec);
      }
    );
  });

apiRouter.route("/billers/payment").post((req, res) => {
  console.log("BILLERS PAYMENT REQUEST: " + JSON.stringify(req.body.details));
  request.post(
    {
      url: common.getBillsPaymentUrl(),
      headers: {
        accept: "application/json",
        "x-ibm-client-id": common.getClientId(),
        "x-ibm-client-secret": common.getClientSecret(),
        "x-partner-id": common.getClientPartnerID(),
        authorization: "Bearer " + req.body.details.access_token
      },
      json: req.body.details.biller_details
    },
    function(err, httpResponse, body) {
      console.log("BILLERS PAYMENT RESPONSE: " + JSON.stringify(httpResponse));
      console.log("status: " + httpResponse.statusCode);
      var log_data = req.body.log_details;
      log_data.params.push({
        api: "Online Bills Payment",
        end_point: common.getBillsPaymentUrl(),
        request: req.body.details,
        response: body
      });
      utils.sendLogs(log_data);
      if (err) {
        console.log("Error", err);
        res.json({
          errorCode: httpResponse.statusCode,
          message: err
        });
      } else {
        var data = {};
        try {
          data = JSON.parse(body);
        } catch (error) {
          data = body;
        }
        if (data.httpCode && data.httpCode == 401) {
          res.json({
            errorCode: httpResponse.statusCode,
            unauthorized: true,
            message: "Unauthorized"
          });
        } else if (data.errors) {
          res.json({
            errorCode: httpResponse.statusCode,
            message: data.errors[0].message,
            params: data.errors[0].params
          });
        } else {
          res.json({
            success: httpResponse.statusCode == 200,
            transaction_id: data.tranId
          });
        }
      }
    }
  );
});

// Casa Balance
apiRouter.route("/accounts/authorization").post((req, res) => {
  var args = {
    url: common.getAccountAuthorizationUrl(),
    headers: {
      "x-ibm-client-id": common.getClientId(),
      "x-ibm-client-secret": common.getClientSecret()
    },
    json: {
      accountNumber: req.body.accountNumber
    }
  };
  request.post(args, (err, response, body) => {
    var data = {};
    try {
      data = JSON.parse(body);
    } catch (error) {
      data = body;
    }
    console.log("accounts authorizations: " + JSON.stringify(data));
    // var log_data = req.body.log_details;
    // log_data.params.push({
    //   api: "Online Accounts",
    //   end_point: common.getAccountAuthorizationUrl(),
    //   request: req.body.details,
    //   response: data
    // });
    // utils.sendLogs(log_data);
    if (data.errors) {
      res.json({
        errorCode: data.errors[0].code,
        message: data.errors[0].message
      });
    } else {
      res.json(data);
    }
  });
});
//
apiRouter.route("/accounts/authorization/verification").post((req, res) => {
  console.log("Request: " + JSON.stringify(req.body));
  var args = {
    url: common.getAccountAuthorizationVerificationUrl(),
    headers: {
      "x-ibm-client-id": common.getClientId(),
      "x-ibm-client-secret": common.getClientSecret()
    },
    json: {
      code: req.body.code,
      referenceId: req.body.referenceId
    }
  };
  request.post(args, (err, response, body) => {
    var data = {};
    try {
      data = JSON.parse(body);
    } catch (error) {
      data = body;
    }
    console.log(
      "accounts authorizations verification: " + JSON.stringify(data)
    );
    // var log_data = req.body.log_details;
    // log_data.params.push({
    //   api: "Online Accounts",
    //   end_point: common.getAccountAuthorizationVerificationUrl(),
    //   request: req.body.details,
    //   response: data
    // });
    // utils.sendLogs(log_data);
    if (data.errors) {
      res.json({
        errorCode: data.errors[0].code,
        message: data.errors[0].message
      });
    } else {
      res.json(data);
    }
  });
});
//
apiRouter
  .route("/accounts/transactions")
  // .get((req, res) => {
  //   var args = {
  //     url: common.getAccountsTransactionUrl(),
  //     headers: {
  //       "x-ibm-client-id": common.getClientId(),
  //       "x-ibm-client-secret": common.getClientSecret(),
  //       authorization: "Bearer " + req.query.access_token
  //     }
  //   };
  //   request.get(args, (err, response, body) => {
  //     var data = {};
  //     try {
  //       data = JSON.parse(body);
  //     } catch (error) {
  //       data = body;
  //     }
  //     console.log("accounts transactions: " + JSON.stringify(data));
  //     if (data.errors) {
  //       res.json({
  //         errorCode: data.errors[0].code,
  //         message: data.errors[0].message
  //       });
  //     } else {
  //       res.json(data);
  //     }
  //   });
  // })
  .post((req, res) => {
    console.log("accounts transactions: " + JSON.stringify(req.body));
    var args = {
      url: common.getAccountsTransactionUrl(),
      headers: {
        "x-ibm-client-id": common.getClientId(),
        "x-ibm-client-secret": common.getClientSecret(),
        authorization: "Bearer " + req.body.details.access_token
      }
    };
    request.get(args, (err, response, body) => {
      var data = {};
      try {
        data = JSON.parse(body);
      } catch (error) {
        data = body;
      }
      console.log("accounts transactions: " + JSON.stringify(data));
      // var log_data = req.body.log_details;
      // log_data.params.push({
      //   api: "Online Accounts",
      //   end_point: common.getAccountsTransactionUrl(),
      //   request: req.body.details,
      //   response: data
      // });
      // utils.sendLogs(log_data);
      if (data.errors) {
        res.json({
          errorCode: data.errors[0].code,
          message: data.errors[0].message
        });
      } else {
        res.json(data);
      }
    });
  });

apiRouter
  .route("/accounts/details")
  // .get((req, res) => {
  //   var args = {
  //     url: common.getAccountsDetailsUrl(),
  //     headers: {
  //       "x-ibm-client-id": common.getClientId(),
  //       "x-ibm-client-secret": common.getClientSecret(),
  //       authorization: "Bearer " + req.query.access_token
  //     }
  //   };
  //   request.get(args, (err, response, body) => {
  //     var data = {};
  //     try {
  //       data = JSON.parse(body);
  //     } catch (error) {
  //       data = body;
  //     }
  //     console.log("accounts details: " + JSON.stringify(data));
  //     if (data.errors) {
  //       res.json({
  //         errorCode: data.errors[0].code,
  //         message: data.errors[0].message
  //       });
  //     } else {
  //       var balances = {};
  //       data.balances.forEach(balance => {
  //         balances[balance.type] = balance.amount;
  //       });
  //       data.balances = balances;
  //       res.json(data);
  //     }
  //   });
  // })
  .post((req, res) => {
    console.log("accounts details: " + JSON.stringify(req.body));
    var args = {
      url: common.getAccountsDetailsUrl(),
      headers: {
        "x-ibm-client-id": common.getClientId(),
        "x-ibm-client-secret": common.getClientSecret(),
        authorization: "Bearer " + req.body.details.access_token
      }
    };
    request.get(args, (err, response, body) => {
      var data = {};
      try {
        data = JSON.parse(body);
      } catch (error) {
        data = body;
      }
      console.log("accounts details: " + JSON.stringify(data));
      // var log_data = req.body.log_details;
      // log_data.params.push({
      //   api: "Online Accounts",
      //   end_point: common.getAccountsDetailsUrl(),
      //   request: req.body.details,
      //   response: data
      // });
      // utils.sendLogs(log_data);
      if (data.errors) {
        res.json({
          errorCode: data.errors[0].code,
          message: data.errors[0].message
        });
      } else {
        var balances = {};
        data.balances.forEach(balance => {
          balances[balance.type] = balance.amount;
        });
        data.balances = balances;
        res.json(data);
      }
    });
  });

//

// GSIS Activation
apiRouter.route("/gsis/activation/:sender_id/:last_action").post((req, res) => {
  var sender_id = req.params.sender_id;
  var last_action = req.params.last_action;
  var args = {
    url: common.getGSISActivationUrl(),
    headers: {
      "x-ibm-client-id": common.getClientId(),
      "x-ibm-client-secret": common.getClientSecret(),
      accept: "application/json"
    },
    json: req.body
  };
  console.log("details req: " + JSON.stringify(req.body));
  request.post(args, (err, response, body) => {
    var data = {};
    try {
      data = JSON.parse(body);
    } catch (error) {
      data = body;
    }
    console.log("details resp: " + JSON.stringify(data));

    var log_details = {
      logtime: new Date(),
      user: sender_id,
      module: last_action,
      action: "GSIS_ACTIVATION_VALIDATION",
      skill: {
        name: "GSIS_ACTIVATION",
        mode: "s"
      },
      params: [
        {
          api: "GSIS Activation",
          end_point: common.getGSISActivationUrl(),
          request: req.body,
          response: data
        }
      ]
    };
    utils.sendLogs(log_details);

    if (data.errors) {
      res.json({
        errorCode: data.errors[0].code,
        message: data.errors[0].message
      });
    } else {
      res.json(data);
    }
  });
});
apiRouter
  .route("/gsis/activation/otp/:sender_id/:last_action")
  .post((req, res) => {
    var sender_id = req.params.sender_id;
    var last_action = req.params.last_action;
    var args = {
      url: common.getGSISOTPUrl(),
      headers: {
        "x-ibm-client-id": common.getClientId(),
        "x-ibm-client-secret": common.getClientSecret(),
        accept: "application/json"
      },
      json: req.body
    };
    console.log("OTP req: " + JSON.stringify(req.body));
    request.post(args, (err, response, body) => {
      var data = {};
      try {
        data = JSON.parse(body);
      } catch (error) {
        data = body;
      }
      console.log("OTP resp: " + JSON.stringify(data));

      var log_details = {
        logtime: new Date(),
        user: sender_id,
        module: last_action,
        action: "GSIS_ACTIVATION_OTP",
        params: [
          {
            api: "GSIS Activation",
            end_point: common.getGSISOTPUrl(),
            request: req.body,
            response: data
          }
        ]
      };
      utils.sendLogs(log_details);

      if (data.errors) {
        res.json({
          errorCode: data.errors[0].code,
          message: data.errors[0].message
        });
      } else {
        res.json(data);
      }
    });
  });

// Update Contact Details
apiRouter
  .route("/cup/validate-account/:sender_id/:last_action")
  .post((req, res) => {
    var sender_id = req.params.sender_id;
    var last_action = req.params.last_action;

    var ipAddress = req.connection.remoteAddress || req.socket.remoteAddress;

    /**
     * for testing purposes only
     * awaiting for PROD credentials
     */
    // var username = "customer-update-portal-api";
    // var password = "pass1234";
    var auth =
      "Basic " + new Buffer(username + ":" + password).toString("base64");

    var req_params = {
      number: req.body.number,
      type: req.body.type,
      ipAddress: ipAddress,
      startTime: new Date(),
      source: "chatbot"
    };

    var args = {
      url: common.getValidateAccountUrl(),
      headers: {
        Authorization: auth,
        Host: "ubpdev.appiancloud.com"
      },
      json: req_params
    };
    request.post(args, (err, response, body) => {
      var data = {};
      try {
        data = JSON.parse(body);
      } catch (error) {
        data = body;
      }

      console.log(
        "######### CUP Validate Account Response: " + JSON.stringify(data)
      );

      var log_details = {
        logtime: new Date(),
        user: sender_id,
        module: last_action,
        action: "CUP_VALIDATE_ACCOUNT",
        skill: {
          name: "UPDATE_CONTACT",
          mode: "s"
        },
        params: [
          {
            api: "Customer Update",
            end_point: common.getValidateAccountUrl(),
            request: req_params,
            response: data
          }
        ]
      };
      utils.sendLogs(log_details);

      // if (data.errors) {
      //     res.json({
      //         errorCode: data.errors[0].code,
      //         message: data.errors[0].message
      //     });
      // } else {
      res.json(data);
      // }
    });
  });

apiRouter
  .route("/cup/validate-answer/:sender_id/:last_action")
  .post((req, res) => {
    var sender_id = req.params.sender_id;
    var last_action = req.params.last_action;
    var token = req.headers["token"];

    /**
     * for testing purposes only
     * awaiting for PROD credentials
     */
    // var username = "customer-update-portal-api";
    // var password = "pass1234";
    var auth =
      "Basic " + new Buffer(username + ":" + password).toString("base64");

    var req_params = {
      token: token,
      answers: req.body
    };

    console.log(
      "######## validate answer request: " + JSON.stringify(req_params)
    );

    var args = {
      url: common.getValidateAnswerUrl(),
      headers: {
        Authorization: auth,
        Host: "ubpdev.appiancloud.com"
      },
      json: req_params
    };
    request.post(args, (err, response, body) => {
      var data = {};
      try {
        data = JSON.parse(body);
      } catch (error) {
        data = body;
      }

      console.log(
        "######### CUP Validate Answer Response: " + JSON.stringify(data)
      );

      var log_details = {
        logtime: new Date(),
        user: sender_id,
        module: last_action,
        action: "CUP_VALIDATE_ANSWER",
        params: [
          {
            api: "Customer Update",
            end_point: common.getValidateAnswerUrl(),
            request: req_params,
            response: data
          }
        ]
      };
      utils.sendLogs(log_details);

      // if (data.errors) {
      //     res.json({
      //         errorCode: data.errors[0].code,
      //         message: data.errors[0].message
      //     });
      // } else {
      res.json(data);
      // }
    });
  });

apiRouter
  .route("/otp")
  .get((req, res) => {
    // var number = req.query.number;
    var number = "09177095076";
    var args = {
      url: common.getOTPReq() + "?number=" + number + "&brand=talk-to-rafa",
      headers: {
        "x-ibm-client-id": common.getClientId(),
        "x-ibm-client-secret": common.getClientSecret(),
        accept: "application/json"
      }
    };
    request.get(args, (err, response, body) => {
      var data = {};
      try {
        data = JSON.parse(body);
      } catch (error) {
        data = body;
      }

      console.log("##### OTP Response: " + JSON.stringify(data));

      res.json(data);
    });
  })
  .post((req, res) => {
    var data = req.body;
    var args = {
      url:
        common.getOTPCheck() +
        "?request_id=" +
        data.request_id +
        "&code=" +
        data.code,
      headers: {
        "x-ibm-client-id": common.getClientId(),
        "x-ibm-client-secret": common.getClientSecret(),
        accept: "application/json"
      }
    };
    request.get(args, (err, response, body) => {
      var data = {};
      try {
        data = JSON.parse(body);
      } catch (error) {
        data = body;
      }

      console.log("##### Verify OTP Response: " + JSON.stringify(data));

      res.json(data);
    });
  });

apiRouter
  .route("/cup/update-account/:sender_id/:last_action")
  .post((req, res) => {
    var sender_id = req.params.sender_id;
    var last_action = req.params.last_action;
    var token = req.headers["token"];

    /**
     * for testing purposes only
     * awaiting for PROD credentials
     */
    // var username = "customer-update-portal-api";
    // var password = "pass1234";
    var auth =
      "Basic " + new Buffer(username + ":" + password).toString("base64");

    var req_params = {
      token: token
    };

    if (req.body.mobile && req.body.mobile != "") {
      req_params.mobileNo = req.body.mobile;
    }
    if (req.body.email && req.body.email != "") {
      req_params.email = req.body.email;
    }

    var args = {
      url: common.getUpdateAccountUrl(),
      headers: {
        Authorization: auth,
        Host: "ubpdev.appiancloud.com"
      },
      json: req_params
    };
    request.post(args, (err, response, body) => {
      var data = {};
      try {
        data = JSON.parse(body);
      } catch (error) {
        data = body;
      }

      console.log(
        "######### CUP Update Account Response: " + JSON.stringify(data)
      );

      var log_details = {
        logtime: new Date(),
        user: sender_id,
        module: last_action,
        action: "CUP_UPDATE_ACCOUNT",
        params: [
          {
            api: "Customer Update",
            end_point: common.getUpdateAccountUrl(),
            request: req_params,
            response: data
          }
        ]
      };
      utils.sendLogs(log_details);

      // if (data.errors) {
      //     res.json({
      //         errorCode: data.errors[0].code,
      //         message: data.errors[0].message
      //     });
      // } else {
      res.json(data);
      // }
    });
  });

apiRouter.route("/recaptcha/sitekey").get((req, res) => {
  console.log("######## RECAPTCHA SITEKEY: " + common.getRecaptchaKey());
  res.json({
    sitekey: common.getRecaptchaKey()
  });
});

apiRouter.route("/recaptcha/verify").get((req, res) => {
  var sender_id = req.headers["sender_id"];
  var last_action = req.headers["last_action"];
  var token = req.headers["token"];

  var args = {
    url:
      common.getRecaptchaUrl() +
      "?secret=" +
      common.getRecaptchaSecret() +
      "&response=" +
      token,
    headers: {
      accept: "application/json"
    }
  };
  request.get(args, (err, response, body) => {
    var data = {};
    try {
      data = JSON.parse(body);
    } catch (error) {
      data = body;
    }

    console.log(
      "######### Recaptcha Verification Response: " + JSON.stringify(data)
    );

    var log_details = {
      logtime: new Date(),
      user: sender_id,
      module: last_action,
      action: "CUP_RECAPTCHA",
      params: [
        {
          api: "Customer Update",
          end_point: common.getRecaptchaUrl(),
          request: {
            secret: common.getRecaptchaSecret(),
            response: token
          },
          response: data
        }
      ]
    };
    utils.sendLogs(log_details);

    // if (data.errors) {
    //     res.json({
    //         errorCode: data.errors[0].code,
    //         message: data.errors[0].message
    //     });
    // } else {
    res.json(data);
    // }
  });
});

// Checkwriter
apiRouter.route("/checkwriter/:sender_id/:last_action").get((req, res) => {
  var sender_id = req.params.sender_id;
  var last_action = req.params.last_action;
  console.log("######### Payee Name: " + req.query.payee_name);
  var args = {
    url:
      common.getcheckwriterUrl() +
      "?payeeName=" +
      req.query.payee_name.toUpperCase(),
    headers: {
      "x-ibm-client-id": common.getClientId(),
      "x-ibm-client-secret": common.getClientSecret(),
      accept: "application/json"
    }
  };
  request.get(args, (err, response, body) => {
    var data = {};
    try {
      data = JSON.parse(body);
    } catch (error) {
      data = body;
    }
    console.log("######### Checkwriter Response: " + JSON.stringify(data));

    var log_details = {
      logtime: new Date(),
      user: sender_id,
      module: last_action,
      action: "CHECKWRITER_SEARCH",
      skill: {
        name: "CHECK_WRITER",
        mode: "s"
      },
      params: [
        {
          api: "CheckWriter",
          end_point: common.getcheckwriterUrl(),
          request: {
            payeeName: req.query.payee_name.toUpperCase()
          },
          response: data
        }
      ]
    };
    utils.sendLogs(log_details);

    if (data.errors) {
      res.json({
        errorCode: data.errors[0].code,
        message: data.errors[0].message
      });
    } else {
      data.releasingBranch.sort();
      res.json(data);
    }
  });
});

// Ratings
apiRouter
  .route("/rating")
  .get((req, res) => {
    request.get(
      {
        url: common.getRatinsgUrl(),
        headers: {
          accept: "application/json",
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret(),
          "x-partner-id": common.getClientPartnerID()
        }
      },
      function(err, httpResponse, body) {
        var rec = JSON.parse(body);
        res.json(rec);
      }
    );
  })
  .post((req, res) => {
    request.get(
      {
        url: common.getRatingsUrl(),
        headers: {
          accept: "application/json",
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret(),
          "x-partner-id": common.getClientPartnerID()
        }
      },
      function(err, httpResponse, body) {
        var rec = JSON.parse(body);
        var log_data = req.body.log_details;
        log_data.params.push({
          api: "Rating Information",
          end_point: common.getRatingsUrl(),
          request: {},
          response: rec
        });
        utils.sendLogs(log_data);
        res.json(rec);
      }
    );
  });

// Credit Card Application
apiRouter
  .route("/submit-application/:sender_id/:last_action")
  .post((req, res) => {
    var sender_id = req.params.sender_id;
    var last_action = req.params.last_action;

    console.log("### application request: " + JSON.stringify(req.body));

    request.post(
      {
        url: common.getSubmitAppUrl(),
        headers: {
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret()
        },
        json: req.body
      },
      function(err, httpResponse, body) {
        var data = {};
        try {
          data = JSON.parse(body);
        } catch (error) {
          data = body;
        }
        console.log("############ cc app submit resp: " + JSON.stringify(data));

        var log_details = {
          logtime: new Date(),
          user: sender_id,
          module: last_action,
          action: "FIND_A_CREDIT_CARD_SUBMIT",
          skill: {
            name: "FIND_A_CREDIT_CARD",
            mode: "s"
          },
          params: [
            {
              api: "Credit Card Application",
              end_point: common.getSubmitAppUrl(),
              request: req.body,
              response: data
            }
          ]
        };
        utils.sendLogs(log_details);

        res.json(data);
      }
    );
  });

apiRouter
  .route("/application-libraries/:sender_id/:last_action")
  .get((req, res) => {
    var sender_id = req.params.sender_id;
    var last_action = req.params.last_action;
    var queries = "";
    for (var q in req.query) {
      queries = queries + (queries !== "" ? "&" : "?") + q + "=" + req.query[q];
    }
    console.log("### libraries requested: " + queries);

    request.get(
      {
        url: common.getAppLibrariesUrl() + queries,
        headers: {
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret()
        }
      },
      function(err, httpResponse, body) {
        var data = {};
        try {
          data = JSON.parse(body);
        } catch (error) {
          data = body;
        }
        console.log(
          "############ cc app libraries resp: " + JSON.stringify(data)
        );

        var log_details = {
          logtime: new Date(),
          user: sender_id,
          module: last_action,
          action: "FIND_A_CREDIT_CARD_LIBRARIES",
          params: [
            {
              api: "Credit Card Application",
              end_point: common.getAppLibrariesUrl(),
              request: req.query,
              response: data
            }
          ]
        };
        utils.sendLogs(log_details);

        res.json(data);
      }
    );
  });

// Application Status
apiRouter
  .route("/application-status/:sender_id/:last_action")
  .get((req, res) => {
    var sender_id = req.params.sender_id;
    var last_action = req.params.last_action;
    console.log("### application appianNumber: " + req.query.appianNumber);

    request.get(
      {
        url: common
          .getStatusAppUrl()
          .replace(":appianNumber", req.query.appianNumber),
        headers: {
          "x-ibm-client-id": common.getClientId(),
          "x-ibm-client-secret": common.getClientSecret()
        }
      },
      function(err, httpResponse, body) {
        var data = {};
        try {
          data = JSON.parse(body);
        } catch (error) {
          data = body;
        }
        console.log("############ app status resp: " + JSON.stringify(data));

        var log_details = {
          logtime: new Date(),
          user: sender_id,
          module: last_action,
          action: "CC_APPLICATION_STATUS_CHECK",
          skill: {
            name: "CC_APPLICATION_STATUS",
            mode: "s"
          },
          params: [
            {
              api: "Credit Card Application Status",
              end_point: common.getStatusAppUrl(),
              request: {
                appianNumber: req.query.appianNumber
              },
              response: data
            }
          ]
        };
        utils.sendLogs(log_details);

        res.json(data);
      }
    );
  });

// Homeloan
apiRouter.route("/homeloan/:sender_id/:last_action").post((req, res) => {
  var sender_id = req.params.sender_id;
  var last_action = req.params.last_action;
  var loan = req.body;
  var args = {
    url:
      common.getHousingLoanUrl() +
      "?term=" +
      loan.term +
      "&dp=" +
      loan.dp +
      "&price=" +
      loan.price,
    headers: {
      "x-ibm-client-id": common.getClientId(),
      "x-ibm-client-secret": common.getClientSecret(),
      accept: "application/json"
    }
  };
  console.log("####### Housing loan req: " + JSON.stringify(loan));
  request.get(args, (err, response, body) => {
    var data = {};
    try {
      data = JSON.parse(body);
    } catch (error) {
      data = body;
    }
    console.log("####### Housing loan resp: " + JSON.stringify(data));

    var log_details = {
      logtime: new Date(),
      user: sender_id,
      module: last_action,
      action: "EXPLORE_HOME_LOAN",
      skill: {
        name: "EXPLORE_HOME_LOAN",
        mode: "s"
      },
      params: [
        {
          api: "Housing Loan",
          end_point: common.getHousingLoanUrl(),
          request: loan,
          response: data
        }
      ]
    };
    utils.sendLogs(log_details);

    if (data.errors) {
      res.json({
        errorCode: data.errors[0].code,
        message: data.errors[0].message
      });
    } else {
      res.json(data);
    }
  });
});

function card_attempt(cc_number, req, user_id, skill) {
  attempt_cc_activation[cc_number].attempts += 1;
  attempt_cc_activation[cc_number].data.push({
    user: user_id,
    date: new Date(),
    request: req
  });
  console.log("attempts: " + JSON.stringify(attempt_cc_activation[cc_number]));
  var message = "";
  if (attempt_cc_activation[cc_number].attempts >= 3) {
    attempt_cc_activation[cc_number].card_number = cc_number;
    attempt_cc_activation[cc_number].skill = skill;
    attempt_cc_activation[cc_number].is_block = true;

    var block = new BlockCardNumberModel();
    block.details = attempt_cc_activation[cc_number];
    block.save();
    console.log("Card Number has been block.");
    message =
      "You have reached maximum failed attempts. Please try to contact our Customer Service Hotline @ +632 841-8600.";
    attempt_cc_activation[cc_number] = {};
    attempt_cc_activation[cc_number].attempts = 0;
    attempt_cc_activation[cc_number].data = [];
  } else {
    message =
      "You only have " +
      (3 - attempt_cc_activation[cc_number].attempts) +
      " attempt/s";
  }
  return message;
}

function checkIfBlock(cc_number, callback) {
  var card_masked =
    "XXXX-XXXX-XXXX-" +
    cc_number.substring(cc_number.length - 4, cc_number.length);
  BlockCardNumberModel.find(
    {
      card_masked: card_masked
    },
    (err, cards) => {
      var isBlock = false;
      console.log("############# cards: " + JSON.stringify(cards));
      if (cards && cards.length > 0) {
        var CardThrow = {};
        try {
          cards.forEach(card => {
            if (card.details.card_number == cc_number) {
              console.log("details: " + JSON.stringify(card.details));
              isBlock = card.details.is_block;
              throw CardThrow;
            }
          });
        } catch (error) {
          if (error !== CardThrow) console.log(error);
        }
      }
      callback({
        is_block: isBlock
      });
    }
  );
}

//Cardless
// apiRouter.route("/userlist").post((req, res) => {
//   if (req.body.username !== undefined) {
//     UserModel.findOne(
//       {
//         "details.username": req.body.username
//       },
//       (err, user) => {
//         AccountsModel.findOne(
//           {
//             "details.account.name": user.details.account.name,
//             "details.account.number": user.details.account.number,
//             "details.pin": user.details.pin
//           },
//           (err, acc) => {
//             res.json({
//               account: acc.details.account,
//               mobile_no: user.details.mobileNumber,
//               success: true,
//               message: "Successfully Retrieve."
//             });
//           }
//         );
//       }
//     );
//   }
// });

// apiRouter.route("/userlist/new").post((req, res) => {
//   if (req.body.account.number !== undefined) {
//     UserModel.find(
//       {
//         $or: [
//           {
//             "details.account.number": req.body.account.number
//           },
//           {
//             "details.username": req.body.username
//           }
//         ]
//       },
//       (err, users) => {
//         if (users.length === 0) {
//           var user = new UserModel();
//           user.details = req.body;

//           var encPass = String(
//             encodeURIComponent(
//               CryptoJS.AES.encrypt(
//                 user.details.password,
//                 common.getSecretToken()
//               )
//             )
//           );
//           user.details.password = encPass;

//           user.save();
//           res.send({
//             success: true,
//             message: "Successfully Saved."
//           });
//         } else {
//           res.send({
//             success: false,
//             message: "Account or Username is already registered."
//           });
//         }
//       }
//     );
//   }
// });

// apiRouter.route("/transaction").post((req, res) => {
//   console.log(JSON.stringify(req.body));
//   var transaction = new TransactionModel();
//   transaction.details = req.body;
//   transaction.save();
//   res.sendStatus(200);
// });

// apiRouter.route("/transactions").post((req, res) => {
//   console.log("###### trans: " + req.body.account_no);
//   TransactionModel.find(
//     {
//       "details.account_no": req.body.account_no
//     },
//     (err, trans) => {
//       console.log("###### trans: " + JSON.stringify(trans));
//       res.json(trans);
//     }
//   );
// });

// apiRouter.route("/account/verification").post((req, res) => {
//   AccountsModel.find(
//     {
//       "details.account.name": req.body.account.name,
//       "details.account.number": req.body.account.number,
//       "details.pin": req.body.pin
//     },
//     (err, accounts) => {
//       if (accounts.length !== 0) {
//         res.json({
//           success: true,
//           message: "Successful"
//         });
//       } else {
//         res.json({
//           success: false,
//           message: "Account does not exist."
//         });
//       }
//     }
//   );
// });

apiRouter.route("/authorization").post((req, res) => {
  if (req.body.username !== undefined) {
    UserModel.findOne(
      {
        "details.username": req.body.username
      },
      (err, users) => {
        var decryptedPass = CryptoJS.AES.decrypt(
          decodeURIComponent(users.details.password),
          common.getSecretToken()
        ).toString(CryptoJS.enc.Utf8);
        if (req.body.password == decryptedPass) {
          res.send({
            success: true,
            message: "You have successfully login."
          });
        } else {
          res.send({
            success: false,
            message: "Invalid Credentials"
          });
        }
      }
    );
  }
});

// abalita: send OTP using clickSend API
// apiRouter.route("/otp/send").post((req, res) => {
//   // var mobile_no = req.body.mobile_no;
//   var mobile_no = "+61411111111";
//   var otp = req.body.otp;

//   request.post(
//     {
//       url: "https://rest.clicksend.com/v3/sms/send",
//       headers: {
//         Authorization:
//           "Basic YWJhbGl0YTowNENFRkVFNC0yRjM4LUMxOEMtQ0MwQy0zMzZGM0YxRDIyOTc="
//       },
//       json: {
//         messages: [
//           {
//             from: "Unionbank",
//             body:
//               "We have received your request for cardless withdrawal. " +
//               otp +
//               " is your One-Time Password (OTP).",
//             to: mobile_no
//           }
//         ]
//       }
//     },
//     (err, httpResponse, body) => {
//       console.log("### response: " + err + ":::" + JSON.stringify(body));
//       res.json(body);
//     }
//   );
// });

// apiRouter.route("/otp/verify").post((req, res) => {
//   var verifiedOtp = req.body.otp === "111111";
//   console.log("verify otp: " + verifiedOtp);
//   res.json({
//     success: verifiedOtp,
//     message: "OTP verification"
//   });
// });

// Autoloan
apiRouter.route("/cars/brands").post((req, res) => {
  request.get(
    {
      url: common.getAutoBrandsURL(),
      headers: {
        "x-ibm-client-id": common.getClientId(),
        "x-ibm-client-secret": common.getClientSecret()
      }
    },
    function(err, httpResponse, body) {
      console.log("car brands response: " + JSON.stringify(body));
      var log_data = req.body.log_details;
      log_data.params.push({
        api: "Car Brands",
        end_point: common.getAutoBrandsURL(),
        request: {},
        response: JSON.parse(body)
      });
      utils.sendLogs(log_data);
      res.send(JSON.parse(body).brands);
    }
  );
});


apiRouter.route("/cars/brands/prices")
.post((req, res) => {
  var filtered_brands = [];
  var ceiling_price = {};
  console.log("req.body.details.price: " + req.body.details.price);
  if (req.body.details.price && req.body.details.price > 0) {
      ceiling_price = { ceiling: req.body.details.price };
  }

  request.get({
      url: common.getAutoBrandsURL(),
      headers: {
          'x-ibm-client-id': common.getClientId(),
          'x-ibm-client-secret': common.getClientSecret()
      }
  },
      function (err, httpResponse, body) {
          var brands = [];
          brands = JSON.parse(body).brands;
          request.get({
              url: common.getAutoVehiclesURL(),
              headers: {
                  'x-ibm-client-id': common.getClientId(),
                  'x-ibm-client-secret': common.getClientSecret()
              },
              qs: ceiling_price
          },
              function (err, httpResponse, body) {
                  var models = [];
                  models = JSON.parse(body);
                  var log_data = req.body.log_details;
                  var param = {
                      api: 'Car Brands',
                      end_point: common.getAutoBrandsURL(),
                      request: ceiling_price,
                      response: models
                  }
                  if (!models.errors) {
                      console.log('brands:::' + JSON.stringify(brands));
                      brands.forEach(function (brand) {
                          var indx = models.findIndex(function (model) {
                              return model.brand === brand;
                          });

                          if (indx > -1) {
                              filtered_brands.push(brand);
                          }
                      });
                      param.response = filtered_brands;
                      log_data.params.push(param);
                      utils.sendLogs(log_data);
                      res.send(filtered_brands);

                  } else {
                      log_data.params.push(param);
                      utils.sendLogs(log_data);
                      res.sendStatus(503);
                  }


              });

      });
})

apiRouter.route("/cars/models").post((req, res) => {
  var car_params = {};
  var car_price = req.body.details.price;
  var car_brand = req.body.details.brand_name;
  console.log("Car Price: " + car_price);
  if (car_price && car_price <= 0) {
    console.log("reset Car Price: " + car_price);
    car_price = undefined;
  }

  if (car_brand && car_price) {
    car_params = {
      brand: car_brand,
      ceiling: car_price
    };
  } else if (car_brand) {
    car_params = { brand: car_brand };
  } else if (car_price) {
    car_params = { ceiling: car_price };
  }

  request.get(
    {
      url: common.getAutoVehiclesURL(),
      headers: {
        "x-ibm-client-id": common.getClientId(),
        "x-ibm-client-secret": common.getClientSecret()
      },
      qs: car_params
    },
    function(err, httpResponse, body) {
      //sort car models
      console.log("loan: " + body);
      var models = JSON.parse(body);
      models.sort(function(a, b) {
        return a.model == b.model ? 0 : +(a.model > b.model) || -1;
      });
      var log_data = req.body.log_details;
      log_data.params.push({
        api: "Car Models",
        end_point: common.getAutoVehiclesURL(),
        request: car_params,
        response: models
      });
      utils.sendLogs(log_data);

      res.send(models);
    }
  );
});

apiRouter.route("/cars/loans")
.post((req, res)=>{
  var offset = 0;
  var result;

  if (req.body.details.price !== undefined) {
      var car_price = req.body.details.price;
      var downpayment = req.body.details.loanDownPayment / 100;
      var amount_financed = car_price * downpayment;
      var loanable_amount = car_price - (amount_financed);

      request.post({
          url: common.getComAutoloanUrl(),
          form: { amount: loanable_amount }
      },
          function (err, httpResponse, body) {
              var data = JSON.parse(body);
              offset = Number(data[0]);
              result = computeAutoLoanService.computeCarAutoLoan(
                  req.body.details.price, req.body.details.loanTerm, req.body.details.loanDownPayment, offset);
              var log_data = req.body.log_details;
              log_data.params.push({
                  api: 'Compute Auto Loan',
                  end_point: common.getComAutoloanUrl(),
                  request: req.body.details,
                  response: result
              });
              utils.sendLogs(log_data);
              res.send(result);
          });
  } else {
      res.send({});
  }
})

module.exports = apiRouter;
