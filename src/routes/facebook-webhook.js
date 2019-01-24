var request = require("request");
var express = require("express");
var path = require("path");
var fb_webhook = express.Router();

var common = require("../utils/constants.js");
var utils = require("../utils/utils.js");

var keywordEventHandler = require('../event_handlers/keyword.js');
var postbackEventHandler = require('../event_handlers/postback.js');
var quickreplyEventHandler = require('../event_handlers/quickreply.js');
var locationEventHandler = require('../event_handlers/location.js');

var autoLoanService = require('../services/autoLoanService.js');

var params = [];

fb_webhook
  .route("/")
    /**
     * facebook verification
     */
  .get((req, res)=> {
    if (req.query["hub.verify_token"] === common.getVerifyToken()) {
      return res.send(req.query["hub.challenge"]);
    }
    res.send("Error, wrong token");
  })

  /**
   * fb event listener
   */
  .post((req, res)=> {
    var messaging_events = req.body.entry[0].messaging;

    for (var i = 0; i < messaging_events.length; i++) {
      var event = req.body.entry[0].messaging[i];
      var sender = event.sender.id;

      if (params[sender] === undefined) {
        params[sender] = {
          sender: sender,
          action: "Persistent Menu"
        };
      }

      if (
        event.message &&
        event.message.text &&
        !event.message.quick_reply &&
        !event.message.is_echo
      ) {
        keywordEventHandler.processRequest(
          sender,
          event.message.text,
          params[sender],
          keyword_params => {
            params[sender] = keyword_params;
          }
        );
      } else if (event.postback) {
        params[sender] = postbackEventHandler.processRequest(
          sender,
          event.postback,
          params[sender]
        );
      } else if (
        event.message !== undefined &&
        event.message !== null &&
        event.message.quick_reply !== undefined &&
        event.message.quick_reply !== null
      ) {
        params[sender] = quickreplyEventHandler.processRequest(
          sender,
          event.message.quick_reply.payload,
          params[sender],
          event.message.text
        );
      } else if (
        event.message !== undefined &&
        event.message !== null &&
        event.message.attachments !== undefined &&
        event.message.attachments !== null &&
        event.message.attachments[0].type === "location"
      ) {
        params[sender] = locationEventHandler.processRequest(
          sender,
          event.message.attachments[0].payload.coordinates,
          params[sender],
          event.message.attachments[0]
        );
      } else if (
        event.message !== undefined &&
        event.message.webview_callback !== undefined
      ) {
        params[sender] = autoLoanService.carSpecificCallback(
          sender,
          event.message.webview_callback.params,
          event.message.webview_callback.mode,
          event.message.webview_callback.zlog
        );
      }
    }
    res.sendStatus(200);
  });

module.exports = fb_webhook
