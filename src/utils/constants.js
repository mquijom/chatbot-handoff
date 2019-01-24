var _this = this;

//DialogFlow

// var CB_DIALOGFLOW_TOKEN = "b0333cbb530e4d1d947258c4c5fa3fd6";
var secret_token = "F1rst_B@nk1ng_Ch@tb0t";

//wit.ai
// =============================================================================
// var WIT_TOKEN = "S2PQZEZZT5J3MJ7OJN6OZUL7GYJVHUXK";

// var secret_token = "F1rst_B@nk1ng_Ch@tb0t"

//UAT (piso-bot-app-uat)
// =============================================================================
var home_url = "https://uatbot.unionbankph.com/";
var token =
  "EAAMbjRnr4NABAK69M6vWvA0c2tFoN8caFoB9Iwf4wBwq8BkqMk2zNbgSYicOZAHZATV82yClY19zoMOeIfNZBQ5X8CpvCdO2ZBZBvhy657rhtZADbZBAWOjQ31OLhkyZBe0dZCrUmQ1xws0yiAAXJzzhusnIZB0HZAMwsv2NENqqriy2gZDZD";
var client_id = "d1359d12-c67b-40e3-bc4e-2147bdb8878b";
var client_secret = "aT1qH7rX8iI0pL3aQ8oV5wB2dL4mO5bG5iG1uY6oE0tX4tP7yT";

var atm_url = "https://api-uat.unionbankph.com/ubp/sb/locators/atms";
var branch_url = "https://api-uat.unionbankph.com/ubp/sb/locators/branches";
var forex_url = "https://api-uat.unionbankph.com/ubp/sb/forex/currencies";
var auto_brands = "https://api-uat.unionbankph.com/ubp/sb/auto/brands";
var auto_vehicles = "https://api-uat.unionbankph.com/ubp/sb/auto/vehicles";
var home_loan = "https://api-uat.unionbankph.com/ubp/sb/housing/loans/compute";

//PROD (talk-to-rafa)
// =============================================================================
//var home_url = "https://talk-to-rafa.herokuapp.com/";
//var token = "EAAbMhqSQuyYBANuPhPS0goZAAxzrfPL9eXHZC5LrxmoaB7ThdbWauF6yYZBJRDZCHdDGm4STHkEFOBn9tqSyXv3ygG4j7OoorGo9WkvK5Xr9QucJBKL86h0DGC80lgpvxKRJRLEVMO5aIVpevLpaSjDKqiIs5mdsL9r3LYZAPSgZDZD"
//var client_id = "8bb509c0-713a-4f59-89e8-a903eb743b26";
//var client_secret = "T5jP4tR8vB5iK2rV5hF5lC3dY4hH1dI7mN1lG3xY0pQ7kK5mR4";

//var atm_url = "https://api.unionbankph.com/ubp/prod/locators/atms";
//var branch_url = "https://api.unionbankph.com/ubp/prod/locators/branches";
//var forex_url = "https://api.unionbankph.com/ubp/prod/forex/currencies";
//var auto_brands="https://api.unionbankph.com/ubp/prod/auto/brands";
//var auto_vehicles="https://api.unionbankph.com/ubp/prod/auto/vehicles";

// google API
// =============================================================================
var google_js_api = "AIzaSyBfY-4T7Shqnr04sfnqw9eyfHWYVnIGDG8";
var google_key = "AIzaSyBGFXOOGNLWRGSdM_qA_3Fy7zeuThLGrYg";

var monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

// exports
// =============================================================================
exports.DEV_MODE = "dev";
exports.PROD = "prod";

exports.setEnv = function (mode) {
  if (this.PROD === mode) {
    home_url = "https://talk-to-rafa.herokuapp.com/";

    token =
      "EAAbMhqSQuyYBANuPhPS0goZAAxzrfPL9eXHZC5LrxmoaB7ThdbWauF6yYZBJRDZCHdDGm4STHkEFOBn9tqSyXv3ygG4j7OoorGo9WkvK5Xr9QucJBKL86h0DGC80lgpvxKRJRLEVMO5aIVpevLpaSjDKqiIs5mdsL9r3LYZAPSgZDZD";

    //ubp api
    client_id = "8bb509c0-713a-4f59-89e8-a903eb743b26";
    client_secret = "T5jP4tR8vB5iK2rV5hF5lC3dY4hH1dI7mN1lG3xY0pQ7kK5mR4";

    atm_url = "https://api.unionbankph.com/ubp/prod/locators/atms";
    branch_url = "https://api.unionbankph.com/ubp/prod/locators/branches";
    forex_url = "https://api.unionbankph.com/ubp/prod/forex/currencies";
    auto_brands = "https://api.unionbankph.com/ubp/prod/auto/brands";
    auto_vehicles = "https://api.unionbankph.com/ubp/prod/auto/vehicles";
  } else {}
};

// exports.commonQuickReplies = function () {
//     var quickReplies = [
//         {
//             "content_type": "text",
//             "title": "Get 💳 Balance",
//             "payload": "BALANCE_INQUIRY"
//         },
//         {
//             "content_type": "text",
//             "title": "Card Activation",
//             "payload": "CARD_ACTIVATION"
//         },
//         {
//             "content_type": "text",
//             "title": "Find an ATM",
//             "payload": "ATM_LOCATOR"
//         },
//         {
//             "content_type": "text",
//             "title": "Find a Branch",
//             "payload": "BRANCH_LOCATOR"
//         },
//         {
//             "content_type": "text",
//             "title": "Explore Auto Loans",
//             "payload": "EXPLORE_AUTO_LOAN"
//         },
//         {
//             "content_type": "text",
//             "title": "Find a Credit Card",
//             "payload": "FIND_A_CREDIT_CARD"
//         },
//         {
//             "content_type": "text",
//             "title": "Get FX Rates",
//             "payload": "FOREX_RATE"
//         },
//         {
//             "content_type": "text",
//             "title": "Leave a Message",
//             "payload": "REDIRECT_URL"
//         }

//     ];

//     return quickReplies;
// }

exports.commonQuickReplies = function () {
  var quickReplies = [{
      // content_type: "text",
      //   title: "Balance Inquiry",
      //   payload: "INQUIRY_MENU"
      // },
      content_type: "text",
      title: "Credit Cards",
      payload: "INQUIRY_MENU"
    },
    {
      content_type: "text",
      title: "Auto & Home Loans",
      payload: "AUTO_HOME_LOAN"
    },
    // {
    //   content_type: "text",
    //   title: "Card Activation",
    //   payload: "ACTIVATION_MENU"
    // },
    // {
    //   content_type: "text",
    //   title: "Get a Credit Card",
    //   payload: "FIND_A_CREDIT_CARD"
    // },
    // {
    //     "content_type": "text",
    //     "title": "Pay Bills",
    //     "payload": "PAY_BILLS"
    // },
    {
      content_type: "text",
      title: "Checkwriter",
      payload: "CHECK_WRITER"
    },
    // {
    //   content_type: "text",
    //   title: "Update Contact",
    //   payload: "UPDATE_CONTACT"
    // },
    {
      content_type: "text",
      title: "Branch / ATM Locator",
      payload: "ATM_BRANCH_LOCATOR"
    },
    // {
    //   content_type: "text",
    //   title: "Find an ATM / Branch",
    //   payload: "ATM_BRANCH_LOCATOR"
    // },
    // {
    //   content_type: "text",
    //   title: "Auto / Home Loans",
    //   payload: "AUTO_HOME_LOAN"
    // },
    {
      content_type: "text",
      title: "Get FX Rates",
      payload: "FOREX_RATE"
    },
    // {
    //   content_type: "text",
    //   title: "Explore Auto Loans",
    //   payload: "EXPLORE_AUTO_LOAN"
    // },
    // {
    //   content_type: "text",
    //   title: "Explore Home Loan",
    //   payload: "EXPLORE_HOME_LOAN"
    // },
    // {
    //   content_type: "text",
    //   title: "Carddless Withdrawal",
    //   payload: "CARDLESS_WITHDRAWAL"
    // },
    // {
    //   content_type: "text",
    //   title: "Leave a Message",
    //   payload: "REDIRECT_URL"
    // }
    // {
    //     "content_type": "text",
    //     "title": "Explore Home Loan",
    //     "payload": "EXPLORE_HOME_LOAN"
    // },
    // {
    //     "content_type": "text",
    //     "title": "Get Interest Rates",
    //     "payload": "INTEREST_RATES"
    // },
    // {
    //     "content_type": "text",
    //     "title": "Get Interest Rates (test2)",
    //     "payload": "INTEREST_RATES_2"
    // },
  ];
  return quickReplies;
};

exports.atmOrBranch = function () {
  return [{
      content_type: "text",
      title: "ATM",
      payload: "ATM_LOCATOR"
    },
    {
      content_type: "text",
      title: "Branch",
      payload: "BRANCH_LOCATOR"
    }
  ];
};

exports.autoOrHome = function () {
  return [{
      content_type: "text",
      title: "Explore Auto Loans",
      payload: "EXPLORE_AUTO_LOAN"
    },
    {
      content_type: "text",
      title: "Explore Home Loan",
      payload: "EXPLORE_HOME_LOAN"
    }
  ];
};

exports.activateQuickReplies = function () {
  return [{
      content_type: "text",
      title: "Credit Card",
      payload: "CARD_ACTIVATION"
    }
    // {
    //   content_type: "text",
    //   title: "GSIS",
    //   payload: "GSIS_ACTIVATION"
    // }
  ];
};

exports.inquiryQuickReplies = function () {
  return [{
      content_type: "text",
      title: "Find a Credit Card",
      payload: "FIND_A_CREDIT_CARD"
    },
    {
      content_type: "text",
      title: "Balance and Transactions",
      payload: "BALANCE_INQUIRY"
    },
    // {
    //   content_type: "text",
    //   title: "Debit Card",
    //   payload: "ACCOUNT_BALANCES"
    // },
    // {
    //   content_type: "text",
    //   title: "Get a Credit Card",
    //   payload: "FIND_A_CREDIT_CARD"
    // },
    {
      content_type: "text",
      title: "Card Activation",
      payload: "ACTIVATION_MENU"
    },
    {
      content_type: "text",
      title: "Application Status",
      payload: "CC_APPLICATION_STATUS"
    }
  ];
};

exports.getBackOfficeUrl = function () {
  // return token;
  return process.env.BACK_OFFICE_URL;
};

exports.getToken = function () {
  // return token;
  // return process.env.FB_PAGE_TOKEN || "EAAcGY3XdAywBAHZAkE34Sw84NC21VTJZCIuA3G4eyBjfRakcqqgG6p2rg8mkg6OrBhBnw0ZBgzowUROIJVbZC4MCRXIuXUsNDVT7At6OsS4WvN8g5apfzbHvZCA1Uvba96ZAAY3jZBy4hziY7roNERee54mtCJdtHhcjsNoIIvZCCQZDZD";
  return process.env.FB_PAGE_TOKEN;
};

exports.getClientId = function () {
  // PROD
  // return "a16641eb-96b5-4f23-b5da-c45af88a883d";

  // UAT
  // return process.env.UBP_CLIENT_ID || "d1359d12-c67b-40e3-bc4e-2147bdb8878b";

  return process.env.UBP_CLIENT_ID;
};

exports.getClientSecret = function () {
  // PROD
  // return "P5oA7vA8nI2vX5eW5pC8nE6cP6pK5aU8tO7jM5aY1qK4uB6vH1";

  // UAT
  // return process.env.UBP_CLIENT_SECRET || "W3bU3xS1qU6rJ5hE4mG1yC1yG4dR8hP5gK6dU6kP7uL8aU2sE4";

  return process.env.UBP_CLIENT_SECRET;
};

exports.getClientPartnerID = function () {
  // return process.env.UBP_CLIENT_PARTNER_ID || '8589fe0f-bcea-4039-98db-c6a09d03cbe5';
  return process.env.UBP_CLIENT_PARTNER_ID;
};

exports.getRecaptchaSecret = function () {
  return process.env.RECAPTCHA_SECRET;
  // return process.env.RECAPTCHA_SECRET || '6Ld-rlEUAAAAAPpNxMitN2cGBfkF3DgolfCITmb3';
};

exports.getRecaptchaKey = function () {
  return process.env.RECAPTCHA_KEY;
  // return process.env.RECAPTCHA_KEY || '6Ld-rlEUAAAAAAo2LgW_DuAKfQbm_DLey6m80McT';
};

exports.getRecaptchaUrl = function () {
  return process.env.RECAPTCHA_URL;
  // return process.env.RECAPTCHA_URL || 'https://www.google.com/recaptcha/api/siteverify';
};

exports.getMongoDBUrl = function () {
  return process.env.MONGODB_URL;
  // return process.env.MONGODB_URL || "mongodb://heroku_zwvgd48v:fvh2m26l2igbp7mo7n6ih76qvn@ds155577.mlab.com:55577/heroku_zwvgd48v";
};

exports.getDialogflowToken = function () {
  // return dialogflow client access token;
  return process.env.CB_DIALOGFLOW_TOKEN;
};

exports.getGooleJSAPIKey = function () {
  return google_js_api;
};

exports.getGooleAPIKey = function () {
  return google_key;
};

exports.getHomeUrl = function () {
  // return home_url;
  return process.env.HOME_URL;
};

exports.getAuthUrl = function () {
  return process.env.CB_AUTH_URL;
};

exports.getVerifyAuthUrl = function () {
  return process.env.CB_AUTH_VERIFY_URL;
};

exports.getVerifyToken = function () {
  return process.env.VERIFY_TOKEN;
};

exports.getOAuth2Url = function () {
  return process.env.CB_OAUTH2_URL;
};

exports.getActivationOTPUrl = function () {
  return process.env.CB_CARD_ACTIVATION_OTP_URL;
};

exports.getHousingLoanUrl = function () {
  // return process.env.HOUSING_LOAN_URL || 'https://api-uat.unionbankph.com/ubp/uat/housing/loans/compute';
  return process.env.HOUSING_LOAN_URL;
};

exports.getBranchURL = function () {
  // return branch_url;
  return process.env.BRANCH_URL;
};

exports.getAtmURL = function () {
  // return atm_url;
  return process.env.ATM_URL;
};

exports.getForexURL = function () {
  // return forex_url;
  return process.env.FOREX_URL;
};

exports.getAutoBrandsURL = function () {
  return process.env.AUTO_BRANDS_URL;
  // return process.env.AUTO_BRANDS_URL || 'https://api-uat.unionbankph.com/ubp/uat/auto/brands';
};

exports.getAutoVehiclesURL = function () {
  return process.env.AUTO_VEHICLES_URL;
  // return process.env.AUTO_VEHICLES_URL || 'https://api-uat.unionbankph.com/ubp/uat/auto/vehicles';
};

exports.getCardActivationUrl = function () {
  // return card_activation;
  return process.env.CB_CARD_ACTIVATION_URL;
};

exports.getCardBalanceUrl = function () {
  // return card_balance;
  return process.env.CB_CARD_BALANCE_URL;
};

exports.getCardDetailsUrl = function () {
  // return card_details;
  return process.env.CB_CARD_DETAILS_URL;
};

exports.getCardStatementSummaryUrl = function () {
  // return card_statement_summary;
  return process.env.CB_CARD_STATEMENT_SUMMARY_URL;
};

exports.getCardStatementTransUrl = function () {
  // return card_statement_trans;
  return process.env.CB_CARD_STATEMENT_TRANS_URL;
};

exports.getCardUnbilledUrl = function () {
  // return card_unbilled;
  return process.env.CB_CARD_UNBILLED_URL;
};

exports.getCardStatusUrl = function () {
  return process.env.CB_CARD_STATUS_URL;
  // return 'https://api.unionbankph.com/ubp/prod/credit/v1/cards/status';
};

exports.getComAutoloanUrl = function () {
  // return com_autoloan;
  return process.env.CB_COM_AUTOLOAN_URL;
};

exports.getDialogflowUrl = function () {
  // return dialogflow_url;
  return process.env.CB_DIALOGFLOW_URL;
};

exports.getDialogflowContextUrl = function () {
  // return dialogflow_url;
  // return process.env.CB_DIALOGFLOW_CONTEXT_URL || 'https://api.dialogflow.com/v1/contexts';
  return process.env.CB_DIALOGFLOW_CONTEXT_URL;
};

exports.getAppLibrariesUrl = function () {
  return process.env.CB_LIBRARIES_APP_URL;
  // return process.env.CB_LIBRARIES_APP_URL || 'https://api-uat.unionbankph.com/ubp/uat/credit/v1/cards/applications/libraries';
};

exports.getSubmitAppUrl = function () {
  return process.env.CB_SUBMIT_APP_URL;
  // return process.env.CB_SUBMIT_APP_URL || 'https://api-uat.unionbankph.com/ubp/uat/credit/v1/cards/applications';
};

exports.getStatusAppUrl = function () {
  return process.env.CB_STATUS_APP_URL;
  // return process.env.CB_STATUS_APP_URL || 'https://api-uat.unionbankph.com/ubp/uat/credit/v1/cards/applications/:appianNumber/status';

  // PROD
  // return 'https://api.unionbankph.com/ubp/prod/credit/v1/cards/applications/:appianNumber/status';
};

exports.getProdBalanceUrl = function () {
  // return prod_balance;
  return process.env.CB_PROD_BALANCE_URL;
};

exports.getProdCifUrl = function () {
  // return prod_cif;
  return process.env.CB_PROD_CIF_URL;
};

exports.getProdStatementHeaderUrl = function () {
  // return prod_statement_header;
  return process.env.CB_PROD_STATEMENT_HEADER_URL;
};

exports.getProdStatementTransUrl = function () {
  // return prod_statement_trans;
  return process.env.CB_PROD_STATEMENT_TRANS_URL;
};

exports.getProdUnbilledUrl = function () {
  // return prod_unbilled;
  return process.env.CB_PROD_UNBILLED_URL;
};

// billers
exports.getBillersUrl = function () {
  return process.env.BILLERS_URL;
  // return process.env.BILLERS_URL || 'https://api-uat.unionbankph.com/ubp/uat/v1/billers'
};

// rating
exports.getRatingssUrl = function () {
  return process.env.RATINGS_URL;
  // return process.env.RATINGS_URL || 'https://back-office-chatbot.herokuapp.com/rates'
};

exports.getBillerReferencesUrl = function () {
  return process.env.BILLER_REFERENCE_URL;
  // return process.env.BILLER_REFERENCE_URL || 'https://api-uat.unionbankph.com/ubp/uat/v1/billers/{id}/references';
};

exports.getBillsPaymentUrl = function () {
  return process.env.BILLS_PAYMENT_URL;
  // return process.env.BILLS_PAYMENT_URL || 'https://api-uat.unionbankph.com/ubp/uat/online/v1/payments/single';
};
//casa inquiry

exports.getAccountAuthorizationUrl = function () {
  return process.env.CASA_ACCOUNT_AUTHORIZATION;
  // return process.env.CASA_ACCOUNT_AUTHORIZATION || 'https://api-uat.unionbankph.com/ubp/uat/chatbot/v1/accounts/authorization';
};

exports.getAccountAuthorizationVerificationUrl = function () {
  return process.env.CASA_ACCOUNT_AUTHORIZATION_VERIFICATION;
  // return process.env.CASA_ACCOUNT_AUTHORIZATION_VERIFICATION || 'https://api-uat.unionbankph.com/ubp/uat/chatbot/v1/accounts/authorization/verification';
};

exports.getAccountsTransactionUrl = function () {
  return process.env.CASA_TRANSACTION_URL;
  // return process.env.CASA_TRANSACTION_URL || 'https://api-uat.unionbankph.com/ubp/uat/online/v1/accounts/transactions';
};

exports.getAccountsDetailsUrl = function () {
  return process.env.CASA_DETAILS_URL;
  // return process.env.CASA_DETAILS_URL || 'https://api-uat.unionbankph.com/ubp/uat/online/v1/accounts/details';
};

exports.getGSISActivationUrl = function () {
  return process.env.GSIS_ACTIVATION_VALIDATE;
  // return process.env.GSIS_ACTIVATION_VALIDATE || 'https://api-uat.unionbankph.com/ubp/uat/gsis/activate/v1/validate';

  // PROD
  // return 'https://api.unionbankph.com/ubp/prod/gsis/activate/v1/validate';
};

exports.getGSISOTPUrl = function () {
  return process.env.GSIS_ACTIVATION_CONFIRM;
  // return process.env.GSIS_ACTIVATION_CONFIRM || 'https://api-uat.unionbankph.com/ubp/uat/gsis/activate/v1/confirm';

  // PROD
  // return 'https://api.unionbankph.com/ubp/prod/gsis/activate/v1/confirm';
};

exports.getValidateAccountUrl = function () {
  return process.env.VALIDATE_ACCOUNT_URL;
  // return process.env.VALIDATE_ACCOUNT_URL || 'https://ubpdev.appiancloud.com/suite/webapi/cup/validate-account';
};

exports.getValidateAnswerUrl = function () {
  return process.env.VALIDATE_ANSWER_URL;
  // return process.env.VALIDATE_ANSWER_URL || 'https://ubpdev.appiancloud.com/suite/webapi/cup/validate-answers';
};

exports.getUpdateAccountUrl = function () {
  return process.env.UPDATE_ACCOUNT_URL;
  // return process.env.UPDATE_ACCOUNT_URL || 'https://ubpdev.appiancloud.com/suite/webapi/cup/update-account';
};

exports.getcheckwriterUrl = function () {
  return process.env.CHECKWRITER_URL;
  // return process.env.CHECKWRITER_URL || 'https://api-uat.unionbankph.com/ubp/uat/paymax/v1/checks';

  //Prod
  // return 'https://api.unionbankph.com/ubp/prod/paymax/v1/checks';

  // v2
  // return "https://api-uat.unionbankph.com/ubp/uat/paymax/v2/checks";
};

exports.getSecretToken = function () {
  return secret_token;
};

exports.getOTPReq = function () {
  return process.env.OTP_REQUEST;
};

exports.getOTPCheck = function () {
  return process.env.OTP_CHECK;
};

exports.getMonthNames = function (month) {
  return monthNames[month];
};

exports.numberWithCommas = function (x) {
  var amount = parseFloat(x).toFixed(2);
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

exports.formatAmount = function (amount) {
  amount = amount.toUpperCase();
  console.log(amount);
  amount = amount.replace(/,/g, "");
  console.log(amount);
  var result = 0;
  if (amount.indexOf("K") !== -1) {
    amount = amount.replace("K", "");
    console.log(amount);
    result = Number(amount) * 1000;
  } else if (amount.indexOf("M") !== -1) {
    amount = amount.replace("M", "");
    console.log(amount);
    result = Number(amount) * 1000000;
  } else {
    result = amount;
  }
  console.log("CONVERTED_AMOUNT: " + Number(result));
  return Number(result);
};