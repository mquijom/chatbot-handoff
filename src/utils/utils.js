var common = require("./constants.js");

var request = require("request");
var async = require("async");
var CryptoJS = require("crypto-js");
var UserDetails = require("../models/UserDetails.js");
var LogsModel = require("../models/LogsModel.js");
// var db_env = "MDB";

exports.sendSeriesMessages = function (sender, messages) {
  async.forEachSeries(
    Object.keys(messages),
    function (itr, callback) {
      sendMessageCallback(sender, messages[itr], callback);
    },
    function (err) {}
  );
};

function sendSeriesMessages(sender, messages) {
  async.forEachSeries(
    Object.keys(messages),
    function (itr, callback) {
      sendMessageCallback(sender, messages[itr], callback);
    },
    function (err) {}
  );
}

function sendMessageCallback(sender, messageData, callback) {
  request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        recipient: {
          id: sender
        },
        message: messageData
      }
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
      callback(null);
    }
  );
}

exports.sendDefaultMEssage = function (sender) {
  var messages = [];

  messages.push({
    text: "I'm sorry, but I don't understand that yet. 😅✌️"
  });
  messages.push({
    text: "I can help you find the closest UnionBank ATM or Branch, and get you the latest FX Rates. I can also help you explore Auto Loans and Credit Cards. Just choose from the buttons below. 👇",
    quick_replies: common.commonQuickReplies()
  });

  sendSeriesMessages(sender, messages);
};

exports.sendWhitelist = function () {
  request({
      url: "https://graph.facebook.com/v2.6/me/thread_settings",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        setting_type: "domain_whitelisting",
        whitelisted_domains: [
          "https://talk-to-rafa.herokuapp.com",
          "https://www.unionbankph.com",
          "https://maps.googleapis.com",
          "https://uatbot.unionbankph.com",
          "https://piso-bot-app-uat.herokuapp.com",
          "https://rafa.unionbankph.com",
          "https://api-uat.unionbankph.com",
          "https://api.unionbankph.com",
          "https://ebanking-vit.unionbankph.com",
          "https://apply.unionbankph.com/",
          "https://apply.unionbankph.com/contact-details/",
          "https://chatbot-handoff.herokuapp.com/",
          "https://rafa-live-demo.herokuapp.com/"
        ],
        domain_action_type: "add"
      }
    },
    function (error, response, body) {
      console.log(response);
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }

      return response;
    }
  );
};

exports.sendGetStarted = function () {
  request({
      url: "https://graph.facebook.com/v2.6/me/messenger_profile",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        get_started: {
          payload: "GET_STARTED"
        }
      }
    },
    function (error, response, body) {
      console.log(response);
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }

      return response;
    }
  );
};

exports.sendPersistentMenu = function () {
  request({
      url: "https://graph.facebook.com/v2.6/me/messenger_profile",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        persistent_menu: [{
            locale: "zh_CN",
            composer_input_disabled: false
          },
          {
            locale: "default",
            composer_input_disabled: false,
            call_to_actions: [{
                type: "nested",
                title: "👨Get Started",
                call_to_actions: [{
                    type: "nested",
                    title: "Credit Cards",
                    call_to_actions: [{
                        type: "postback",
                        title: "Find a Credit Card",
                        payload: "FIND_A_CREDIT_CARD"
                      },
                      {
                        type: "postback",
                        title: "Balance and Transactions",
                        payload: "BALANCE_INQUIRY"
                      },
                      {
                        type: "postback",
                        title: "Card Activation",
                        payload: "CARD_ACTIVATION"
                      },
                      {
                        type: "postback",
                        title: "Application Status",
                        payload: "CC_APPLICATION_STATUS"
                      }
                    ]
                  },
                  {
                    type: "nested",
                    title: "Auto & Home Loans",
                    call_to_actions: [{
                        type: "postback",
                        title: "Explore Auto Loans",
                        payload: "EXPLORE_AUTO_LOAN"
                      },
                      {
                        type: "postback",
                        title: "Explore Home Loan",
                        payload: "EXPLORE_HOME_LOAN"
                      }
                    ]
                  },
                  {
                    type: "postback",
                    title: "Checkwriter",
                    payload: "CHECK_WRITER"
                  },
                  {
                    type: "nested",
                    title: "Branch / ATM Locator",
                    call_to_actions: [{
                        type: "postback",
                        title: "Find an ATM",
                        payload: "ATM_LOCATOR"
                      },
                      {
                        type: "postback",
                        title: "Find a Branch",
                        payload: "BRANCH_LOCATOR"
                      }
                    ]
                  },
                  {
                    type: "postback",
                    title: "Get FX Rates",
                    payload: "FOREX_RATE"
                  }
                ]
                // type: "postback",
                // title: "👨Get Started",
                // payload: "MENU"
              },
              {
                type: "postback",
                title: "📬Leave a Message",
                payload: "REDIRECT_URL"
              },
              // {
              //   type: "nested",
              //   title: "Find a UnionBank near you",
              //   call_to_actions: [{
              //       type: "postback",
              //       title: "Find an ATM",
              //       payload: "ATM_LOCATOR"
              //     },
              //     {
              //       type: "postback",
              //       title: "Find a Branch",
              //       payload: "BRANCH_LOCATOR"
              //     }
              //   ]
              // },
              // {
              //   type: "postback",
              //   title: "Help",
              //   payload: "HELP_OPTION"
              // }
              {
                type: "postback",
                title: "🔍Privacy Policy",
                payload: "POLICY_OPTION"
              }
            ]
          }
        ]
      }
    },
    function (error, response, body) {
      console.log(response);
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
      return response;
    }
  );
};

exports.typing = function (sender) {
  request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        recipient: {
          id: sender
        },
        sender_action: "typing_on"
      }
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
    }
  );
};

function sendMessage(sender, messageData) {
  request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        recipient: {
          id: sender
        },
        message: messageData
      }
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
    }
  );
}

exports.sendMessageCallback = function (sender, messageData, callback) {
  request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        recipient: {
          id: sender
        },
        message: messageData
      }
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
      callback(null);
    }
  );
};

exports.sendMessage = function (sender, messageData) {
  request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        recipient: {
          id: sender
        },
        message: messageData
      }
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }
    }
  );
};

exports.sendFAQMessage = function (sender, message) {
  var messageData = {
    text: message
  };

  request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        recipient: {
          id: sender
        },
        message: messageData
      }
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }

      sendEndGreeting(sender);
    }
  );
};

exports.sendComplaintCard = function (sender, params) {
  var messageData = {
    text: "Kindly review your complaint details:" +
      "\ncomplaint: " +
      params.complaint +
      "\nfullname: " +
      params.fullname +
      "\nmobile: " +
      params.mobile +
      "\nemail: " +
      params.email +
      "\n\nIs this correct?",
    quick_replies: [{
        content_type: "text",
        title: "Yes",
        payload: "SEND_COMPLAINT"
      },
      {
        content_type: "text",
        title: "No",
        payload: "COMPLAINT_ISSUES"
      }
    ]
  };

  sendMessage(sender, messageData);
};

exports.sendEndComplaintCard = function (sender) {
  var messageData = {
    text: "Thank you. I will get back to you in the soonest possible time. You may also go to our website or call our hotline."
  };

  request({
      url: "https://graph.facebook.com/v2.6/me/messages",
      qs: {
        access_token: common.getToken()
      },
      method: "POST",
      json: {
        recipient: {
          id: sender
        },
        message: messageData
      }
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }

      sendEndGreeting(sender);
    }
  );
};

exports.sendFAQCard = function (sender) {
  var messageData = {
    text: "Just type in your question and i'll try my best to answer your queries. \n\n" +
      "If, however, you have any complaints or issues, kindly address it to me so i can help you in any way i can. \n\n",
    quick_replies: [{
        content_type: "text",
        title: "Main Menu",
        payload: "MENU"
      },
      {
        content_type: "text",
        title: "Call Hotline",
        payload: "CALL_US"
      },
      {
        content_type: "text",
        title: "Email Us",
        payload: "EMAIL_US"
      },
      {
        content_type: "text",
        title: "Complaint/Issues",
        payload: "COMPLAINT_ISSUES"
      }
    ]
  };

  sendMessage(sender, messageData);
};

function getUserProfile(sender) {
  console.log("getting information for sender ...");
  request({
      url: "https://graph.facebook.com/v2.6/" +
        sender +
        "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" +
        common.getToken(),
      method: "GET"
    },
    function (error, response, body) {
      console.log("return json: " + body);
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }

      return JSON.parse(body);
    }
  );
}

function sendTextMessage(sender, text) {
  var messageData = {
    text: text
  };
  sendMessage(sender, messageData);
}

exports.sendTextMessage = function (sender, text) {
  var messageData = {
    text: text
  };
  sendMessage(sender, messageData);
};

exports.sendVideoMessage = function (sender, url) {
  var messageData = {
    attachment: {
      type: "video",
      payload: {
        url: url
      }
    }
  };
  sendMessage(sender, messageData);
};

exports.sendCallMessageCard = function (sender) {
  var messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "You may reach us through these numbers: \n\n" +
          "Customer Service: 84-186 or (02) 841-8600 \n" +
          "Domestic Toll Free (for PLDT landline only): 1800-1888-2277\n" +
          "Universal Toll Free: (IAC) +800-8277-2273\n" +
          "Trunkline: (02) 667-6388 \n\n" +
          "Thank you for using Stella. Your friendly Bankbot!",
        buttons: [{
            type: "phone_number",
            title: "Call Now",
            payload: "+6328418600"
          },
          {
            type: "postback",
            title: "Main Menu",
            payload: "MENU"
          }
        ]
      }
    }
  };

  sendMessage(sender, messageData);
};

exports.sendEmailMessageCard = function (sender) {
  var messageData = {
    text: "You can send an email to customer.service@unionbankph.com.\n\n Thank you for using Stella. Your friendly Bankbot! \n\n",
    quick_replies: [{
      content_type: "text",
      title: "Main Menu",
      payload: "MENU"
    }]
  };

  sendMessage(sender, messageData);
};

exports.constructEndGreeting = function () {
  var messageData = {
    //        "text": "If i fail to answer all your concerns, Please let me know. Just type in your question and i'll try my best to answer your queries.\n\n"
    //                + "Do you want to call our hotline or send an email instead? Let me know.\n\n"
    //                + "What do you want me to do next?",
    quick_replies: [{
        content_type: "text",
        title: "Find an ATM",
        payload: "ATM_LOCATOR"
      },
      {
        content_type: "text",
        title: "Find a Branch",
        payload: "BRANCH_LOCATOR"
      },
      {
        content_type: "text",
        title: "Get FX Rates",
        payload: "FOREX_RATE"
      },
      {
        content_type: "text",
        title: "Leave a Message",
        payload: "REDIRECT_URL"
      }
    ]
  };

  return messageData;
};

exports.sendEndGreeting = function (sender) {
  var messageData = {
    //        "text": "If i fail to answer all your concerns, Please let me know. Just type in your question and i'll try my best to answer your queries.\n\n"
    //                + "Do you want to call our hotline or send an email instead? Let me know.\n\n"
    //                + "What do you want me to do next?",
    quick_replies: [{
        content_type: "text",
        title: "Main Menu",
        payload: "MENU"
      },
      {
        content_type: "text",
        title: "Email Us",
        payload: "EMAIL_US"
      },
      {
        content_type: "text",
        title: "Call Hotline",
        payload: "CALL_US"
      }
    ]
  };

  sendMessage(sender, messageData);
};

function sendEndGreeting(sender) {
  var messageData = {
    text: "If your concerns were not addressed by any of our resources, you can go back to the main menu, send us an email or call our hotline.",
    quick_replies: [{
        content_type: "text",
        title: "Main Menu",
        payload: "MENU"
      },
      {
        content_type: "text",
        title: "Email Us",
        payload: "EMAIL_US"
      },
      {
        content_type: "text",
        title: "Call Hotline",
        payload: "CALL_US"
      }
    ]
  };

  sendMessage(sender, messageData);
}

exports.sendWelcomeMessage = function (sender) {
  request({
      url: "https://graph.facebook.com/v2.6/" +
        sender +
        "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" +
        common.getToken(),
      method: "GET"
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }

      var user = JSON.parse(body);
      console.log("USER DETAILS: \n" + body);

      console.log(
        "###############################\n#####CHECKING USER DETAILS#####\n###############################"
      );

      UserDetails.findOne({
        "details.id": sender
      }, (err, rafa_user) => {
        var messages = [];
        if (err) {
          console.log("################# USER DETAILS DB ERROR: " + err);
          console.log(
            "################# USER DETAILS DB ERROR: " + JSON.stringify(err)
          );
        } else {
          // messages.push({
          //   text: "Hi " + user.first_name + "! 👋\n\n"
          // });
          messages.push({
            text: "Hi " + user.first_name + "! 👋 I'm Rafa, your personal bank bot 🤖 from UnionBank. I'm here to immediately assist you with your basic banking needs. 👍Click on 'Get Started' from the menu below to find out some of the things I can do for you! Be on the lookout as we continuously roll out more features!😉"
          });
          //        messages.push({text: "For other stuff, please visit unionbankph.com"});

          // Data Privacy Policy
          // Subscribe
          // console.log("DPP: " + rafa_user.details.receivedDPP);
          // messages.push({
          //   text: "By proceeding, you agree to UnionBank's Data Privacy Policy."
          // });
          messages.push({
            attachment: {
              type: "template",
              payload: {
                template_type: "button",
                text: "By proceeding, you agree to UnionBank's Data Privacy Policy. To know more about our policy, click the button below.🔍",
                buttons: [{
                  type: "web_url",
                  url: "https://www.unionbankph.com/privacy-and-security/privacy-statement-and-security",
                  title: "More"
                }]
              }
            }
          });

          if (rafa_user === null) {
            messages.push({
              text: "You are currently receiving promotional messages from Rafa."
            });
            messages.push({
              attachment: {
                type: "template",
                payload: {
                  template_type: "button",
                  text: "To unsubscribe, you may click the button below.",
                  buttons: [{
                    type: "postback",
                    title: "Unsubscribe",
                    payload: "UNSUBSCRIPTION"
                  }]
                }
              }
            });
            var user_details = new UserDetails();
            user_details.details = user;
            user_details.details.receivedDPP = true;
            user_details.details.subscribe = true;
            user_details.details.date_created = new Date();
            user_details.save();
            console.log("###Success saving USER DETAILS");
          }

          messages.push({
            text: "How can I help you today?",
            quick_replies: common.commonQuickReplies()
          });

          sendSeriesMessages(sender, messages);
        }
      });
    }
  );
};

exports.unsubscribeUser = function (sender) {
  UserDetails.findOne({
    "details.id": sender
  }, (err, user) => {
    if (user && user !== null) {
      user.details.subscribe = false;
      user.save();

      var messages = [];

      messages.push({
        text: "You are now unsubscribe."
      });
      //        messages.push({text: "For other stuff, please visit unionbankph.com"});
      messages.push({
        text: "What do you want to do next?",
        quick_replies: common.commonQuickReplies()
      });

      sendSeriesMessages(sender, messages);
    }
  });
};

exports.sendGetStartedCard = function (sender) {
  var messages = [];
  request({
      url: "https://graph.facebook.com/v2.6/" +
        sender +
        "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" +
        common.getToken(),
      method: "GET"
    },
    function (error, response, body) {
      if (error) {
        console.log("Error sending messages: ", error);
      } else if (response.body.error) {
        console.log("Error: ", response.body.error);
      }

      var user = JSON.parse(body);

      console.log("###CHECKING USER DETAILS###");

      messages.push({
        text: "You are currently receiving promotional messages from Rafa."
      });
      messages.push({
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: "To unsubscribe, you may click the button below.",
            buttons: [{
              type: "postback",
              title: "Unsubscribe",
              payload: "UNSUBSCRIPTION"
            }]
          }
        }
      });

      messages.push({
        text: "How can I help you today?",
        quick_replies: common.commonQuickReplies()
      });

      sendSeriesMessages(sender, messages);

      // UserDetails.findOne({
      //   "details.id": sender
      // }, (err, rafa_user) => {
      //   var messages = [];

      //   if (err) {
      //     console.log("################# USER DETAILS DB ERROR: " + err);
      //     console.log(
      //       "################# USER DETAILS DB ERROR: " + JSON.stringify(err)
      //     );
      //   } else {

      //     messages.push({
      //       text: "Hi " + user.first_name + "! 👋 I'm Rafa, your personal bank bot 🤖 from UnionBank. I'm here to immediately assist you with your basic banking needs. 👍Click on 'Get Started' from the menu below to find out some of the things I can do for you! Be on the lookout as we continuously roll out more features!😉"
      //     });
      //     // messages.push({
      //     //   text: "Hi " + user.first_name + "! 👋\n\n"
      //     // });
      //     // messages.push({
      //     //   text: "I'm Rafa, your personal bank bot 🤖 from UnionBank. I can quickly help you find our closest ATM and Branch, or let you know our latest FX rates. I can also help you on Auto Loans and Credit Cards. Just scroll the buttons sideways below to see my skills. 💪"
      //     // });
      //     //        messages.push({text: "For other stuff, please visit unionbankph.com"});

      //     // Data Privacy Policy
      //     // Subscribe
      //     // console.log("DPP: " + rafa_user.details.receivedDPP);
      //     // messages.push({
      //     //   text: "By proceeding, you agree to UnionBank's Data Privacy Policy."
      //     // });
      //     // messages.push({
      //     //   attachment: {
      //     //     type: "template",
      //     //     payload: {
      //     //       template_type: "button",
      //     //       text: "To know more about our policy, click the button below.",
      //     //       buttons: [{
      //     //         type: "web_url",
      //     //         url: "https://www.unionbankph.com/privacy-and-security/privacy-statement-and-security",
      //     //         title: "More"
      //     //       }]
      //     //     }
      //     //   }
      //     // });
      //     messages.push({
      //       attachment: {
      //         type: "template",
      //         payload: {
      //           template_type: "button",
      //           text: "By proceeding, you agree to UnionBank's Data Privacy Policy. To know more about our policy, click the button below.🔍",
      //           buttons: [{
      //             type: "web_url",
      //             url: "https://www.unionbankph.com/privacy-and-security/privacy-statement-and-security",
      //             title: "More"
      //           }]
      //         }
      //       }
      //     });

      //     if (rafa_user === null) {
      //       messages.push({
      //         text: "You are currently receiving promotional messages from Rafa."
      //       });
      //       messages.push({
      //         attachment: {
      //           type: "template",
      //           payload: {
      //             template_type: "button",
      //             text: "To unsubscribe, you may click the button below.",
      //             buttons: [{
      //               type: "postback",
      //               title: "Unsubscribe",
      //               payload: "UNSUBSCRIPTION"
      //             }]
      //           }
      //         }
      //       });
      //       var user_details = new UserDetails();
      //       user_details.details = user;
      //       user_details.details.receivedDPP = true;
      //       user_details.details.subscribe = true;
      //       user_details.details.date_created = new Date();
      //       user_details.save();
      //       console.log("###Success saving USER DETAILS");
      //     }

      //     messages.push({
      //       text: "How can I help you today?",
      //       quick_replies: common.commonQuickReplies()
      //     });

      //     sendSeriesMessages(sender, messages);
      //   }
      // });
    }
  );
};

exports.sendATMLocator = function (sender) {
  var messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "ATM Locator",
          image_url: common.getHomeUrl() + "/public/piso_image.jpg",
          buttons: [{
              type: "postback",
              title: "Search Nearby ATM",
              payload: "SEARCH_ATM"
            },
            {
              type: "postback",
              title: "View All",
              payload: "VIEW_ALL_ATMS"
            }
          ]
        }]
      }
    }
  };
  sendMessage(sender, messageData);
};

exports.sendBranchLocator = function (sender) {
  var messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "generic",
        elements: [{
          title: "Branch Locator",
          image_url: common.getHomeUrl() + "/public/piso_image_2.jpg",
          buttons: [{
              type: "postback",
              title: "Search Nearby Branch",
              payload: "SEARCH_BRANCH"
            },
            {
              type: "postback",
              title: "View All",
              payload: "VIEW_ALL_BRANCH"
            }
          ]
        }]
      }
    }
  };
  sendMessage(sender, messageData);
};

exports.serchATM = function (sender) {
  var messageData = {
    text: "UnionBank clients can enjoy fee free access to withdraw their cash at more than 39 ATM's nationwide. For me to locate an ATM, please send me your current location.",
    quick_replies: [{
        content_type: "location"
      },
      {
        content_type: "text",
        title: "View all",
        payload: "VIEW_ALL_ATMS"
      },
      {
        content_type: "text",
        title: "Main Menu",
        payload: "MENU"
      }
    ]
  };
  sendMessage(sender, messageData);
};

exports.serchBranch = function (sender) {
  var messageData = {
    text: "UnionBank has 189 branches nationwide. I can locate the one nearest you. But for me to that, i need to know your location \n\n" +
      "If you choose not to share your location, just select 'View All' so i can list down all the branches for you.\n\n" +
      "Kindly send me your location so i can locate the nearest branch.",
    quick_replies: [{
        content_type: "location"
      },
      {
        content_type: "text",
        title: "View all",
        payload: "VIEW_ALL_BRANCH"
      },
      {
        content_type: "text",
        title: "Main Menu",
        payload: "MENU"
      }
    ]
  };
  sendMessage(sender, messageData);
};

exports.locationRequest = function (sender) {
  var messageData = {
    text: "Kindly send me your location so I can give you directions.",
    quick_replies: [{
        content_type: "location"
      },
      {
        content_type: "text",
        title: "Cancel",
        payload: "MENU"
      }
    ]
  };
  sendMessage(sender, messageData);
};

exports.sendReset = function (sender) {
  var messages = [];

  messages.push({
    text: "👍"
  });
  // messages.push({
  //   text: "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal."
  // });
  messages.push({
    text: "Alright. Is there anything else I can help you with?",
    quick_replies: common.commonQuickReplies()
  });

  sendSeriesMessages(sender, messages);
};

exports.distance = function (lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == "K") {
    dist = dist * 1.609344;
  }
  if (unit == "N") {
    dist = dist * 0.8684;
  }
  return dist;
};

exports.redirectConfirmation = function (sender) {
  var messageData = {
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "Let's switch to our main Facebook Messenger profile where you can leave your message. Is this ok with you?",
        buttons: [{
            type: "web_url",
            url: "http://m.me/94992081403/",
            webview_height_ratio: "compact",
            title: "Yes 👍"
          },
          {
            type: "postback",
            title: "Not Now",
            payload: "RESET"
          }
        ]
      }
    }
  };

  sendMessage(sender, messageData);
};

exports.findACreditCard = function (sender) {
  var messages = [];
  messages.push({
    text: "Let's see. Which card benefit do you like? 🤔",
    quick_replies: [{
        "content_type": "text",
        "title": "Travel ✈️",
        "payload": "LIST_CREDIT_CARD_TRAVEL"
      },
      {
        "content_type": "text",
        "title": "Cashback 💸",
        "payload": "LIST_CREDIT_CARD_CASHBACK"
      },
      {
        "content_type": "text",
        "title": "Rewards 🏆",
        "payload": "LIST_CREDIT_CARD_REWARDS"
      }
    ]
  });
  sendSeriesMessages(sender, messages);
};

exports.creditCardApplicationStatus = function (sender) {
  var messages = [];
  messages.push({
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Alright ! I’ll need to ask for your reference number to get the status of your credit card application",
        "buttons": [{
            "type": "web_url",
            "url": common.getHomeUrl() + "/application/status?sender=" + sender,
            "title": "🔒 Proceed",
            "webview_height_ratio": "tall",
            "messenger_extensions": true
          },
          {
            "title": "Not Now",
            "type": "postback",
            "payload": "RESET"
          }
        ]
      }
    }
  });
  sendSeriesMessages(sender, messages);
};

exports.checkStatus = function (sender) {
  var messages = [];
  messages.push({
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Okay, let's start. Get your Checkwriter details ready.",
        "buttons": [{
            "type": "web_url",
            "url": common.getHomeUrl() + "/checkwriter?sender=" + sender,
            "title": "Proceed",
            "webview_height_ratio": "full",
            "messenger_extensions": true
          },
          {
            "title": "Not Now",
            "type": "postback",
            "payload": "RESET"
          }
        ]
      }
    }
  });
  sendSeriesMessages(sender, messages);
};

exports.activateCard = function (sender) {
  var messages = [];
  messages.push({
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Okay, let's start. Get your card details ready. 💳",
        "buttons": [{
            "type": "web_url",
            "url": common.getHomeUrl() + "/card-activation?sender=" + sender,
            "title": "🔒 Proceed",
            "webview_height_ratio": "full",
            "messenger_extensions": true
          },
          {
            "title": "Not Now",
            "type": "postback",
            "payload": "RESET"
          }
        ]
      }
    }
  });
  sendSeriesMessages(sender, messages);
};

exports.balanceInquiry = function (sender) {
  var messages = [];
  messages.push({
    "text": "I’ll need to ask for your credit card number and a One-Time Password (OTP) to get your balance and recent transactions."
  });
  messages.push({
    "text": "Check your card balance anytime, anywhere with the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal."
  });
  messages.push({
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "generic",
        "elements": [{
          "title": "Get Balance & Transactions",
          "subtitle": "",
          "image_url": common.getHomeUrl() + "/public/ubpicon.png",
          "buttons": [{
              "type": "web_url",
              "url": common.getHomeUrl() + "/login2?sender=" + sender,
              "title": "🔒 Proceed",
              "webview_height_ratio": "full",
              "messenger_extensions": true
            },
            {
              "title": "Not Now",
              "type": "postback",
              "payload": "RESET"
            }
          ]
        }]
      }
    }
  });
  sendSeriesMessages(sender, messages);
}

exports.exploreAutoLoan = function (sender) {
  var messages = [];
  messages.push({
    text: "Alright! Let's look at Auto Loans. How do you want us to start?",
    quick_replies: [{
        "content_type": "text",
        "title": "I have a car in mind",
        "payload": "CAR_LOAN_STEP1_OPTION1"
      },
      {
        "content_type": "text",
        "title": "Start with my budget",
        "payload": "CAR_LOAN_STEP1_OPTION2"
      },
      {
        "content_type": "text",
        "title": "Maybe later",
        "payload": "RESET"
      }
    ]
  });

  sendSeriesMessages(sender, messages);
};

exports.exploreHomeLoan = function (sender) {

  var messages = [];
  messages.push({
    "attachment": {
      "type": "template",
      "payload": {
        "template_type": "button",
        "text": "Great! You can apply for a home loan here.",
        // "text": "Great! Can you share with me the house details and your downpayment information?",
        "buttons": [{
            //     "type": "web_url",
            //     "url": common.getHomeUrl() + "/homeloan?sender=" + sender,
            //     "title": "Sure! 🏡👪",
            //     "webview_height_ratio": "full",
            //     "messenger_extensions": true
            // },
            "type": "web_url",
            "url": "https://www.unionbankph.com/personal/loans/home-loans/self-assessment-form",
            "title": "Apply! 🏡👪",
            "webview_height_ratio": "full",
          },
          {
            "title": "Not Now",
            "type": "postback",
            "payload": "RESET"
          }
        ]
      }
    }
  });

  sendSeriesMessages(sender, messages);
};

exports.sendHelpMenuCard = function (sender) {
  messages = [];
  messages.push({
    attachment: {
      type: "template",
      payload: {
        template_type: "button",
        text: "By proceeding, you agree to UnionBank's Data Privacy Policy. To know more about our policy, click the button below.🔍",
        buttons: [{
          type: "web_url",
          url: "https://www.unionbankph.com/privacy-and-security/privacy-statement-and-security",
          title: "More"
        }]
      }
    }
  });
  // messages.push({
  //   text: "No worries."
  // });
  // messages.push({
  //   text: "I can help you find the closest UnionBank ATM or Branch, and get you our latest FX Rates. I can also help you explore Auto Loans and Credit Cards. Simply choose from the buttons below. 👇",
  //   quick_replies: common.commonQuickReplies()
  // });
  sendSeriesMessages(sender, messages);
};

exports.sendLogs = function (logs) {
  UserDetails.findOne({
    "details.id": logs.user
  }, (err, rafa_user) => {
    if (err) {
      console.log("################# SENDING LOGS DB ERROR: " + err);
      console.log(
        "################# SENDING LOGS DB ERROR: " + JSON.stringify(err)
      );
    } else if (rafa_user != null) {
      logs.id = logs.user;
      logs.user =
        rafa_user.details.first_name + " " + rafa_user.details.last_name;

      var log = new LogsModel();
      log.details = logs;
      log.save();
    } else {
      request({
          url: "https://graph.facebook.com/v2.6/" +
            logs.user +
            "?fields=first_name,last_name,profile_pic,locale,timezone,gender&access_token=" +
            common.getToken(),
          method: "GET"
        },
        function (error, response, body) {
          if (error) {
            console.log("Error sending messages: ", error);
          } else if (response.body.error) {
            console.log("Error: ", response.body.error);
          }
          var user = JSON.parse(body);
          logs.id = logs.user;
          logs.user = user.first_name + " " + user.last_name;

          var log = new LogsModel();
          log.details = logs;
          log.save();
        }
      );
    }
  });
};

exports.redirectUrl = function (path, params) {
  console.log(JSON.stringify(req.body));
  var encryptedParams = String(
    encodeURIComponent(
      CryptoJS.AES.encrypt(JSON.stringify(params), common.getSecretToken())
    )
  );
  var url = path + "?token=" + encryptedParams;
  return url;
};

exports.retrieveDataFromUrl = function (params) {
  console.log(JSON.stringify(params));
  try {
    var decryptedParams = CryptoJS.AES.decrypt(
      decodeURIComponent(params),
      common.getSecretToken()
    ).toString(CryptoJS.enc.Utf8);
    console.log(JSON.stringify(decryptedParams));
    return JSON.parse(decryptedParams);
  } catch (error) {
    console.log("ERROR TOKEN: " + error);
    var er = {
      errorCode: "11001",
      message: "Invalid Token"
    };
    return er;
  }
};