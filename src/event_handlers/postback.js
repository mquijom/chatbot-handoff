var utils = require('../utils/utils.js');

var atmService = require('../services/atmService.js');
var branchService = require('../services/branchService.js');
var locationService = require('../services/locationService.js');
var forexService = require('../services/forexService.js');
var loanService = require('../services/loanService.js');
var autoloanService = require('../services/autoLoanService.js');
var accountService = require('../services/accountService.js');
var interestService = require('../services/interestService.js');
var checkWriterService = require('../services/checkWriterService.js');
var homeLoanService = require('../services/homeLoanService.js');
var cardActivation = require('../services/cardActivation.js');

var creditCardService = require('../services/creditCardService.js');

var balanceInquiryService = require('../services/balanceInquiryService.js');

exports.processRequest = function (sender, postback, params) {
    var logaction = postback.title;
    var logmodule = params.action;
    var text = JSON.stringify(postback);
    var details = [];
    var alreadyLog = false;
    var skill = null;
    console.log("POSTBACK: " + text);
    // if (text.indexOf('ACTIVATION_MENU') !== -1) {
    //     params = {};
    //     utils.activateQuickReplies(sender);
    if (text.indexOf('MENU') !== -1) {
        params = {};
        logaction = 'Get Started';
        utils.sendWelcomeMessage(sender);
    } else if (text.indexOf('GET_STARTED') !== -1) {
        params = {};
        utils.sendGetStartedCard(sender);
        // } else if (text.indexOf('HELP_OPTION') !== -1) {
        //     params = {};
        //     utils.sendHelpMenuCard(sender);
    } else if (text.indexOf('FIND_A_CREDIT_CARD') !== -1) {
        params = {};
        utils.findACreditCard(sender);
    } else if (text.indexOf('CHECK_WRITER') !== -1) {
        params = {};
        utils.checkStatus(sender);
    } else if (text.indexOf('BALANCE_INQUIRY') !== -1) {
        params = {};
        utils.balanceInquiry(sender);
    } else if (text.indexOf('CARD_ACTIVATION') !== -1) {
        params = {};
        utils.activateCard(sender);
    } else if (text.indexOf('CC_APPLICATION_STATUS') !== -1) {
        params = {};
        utils.creditCardApplicationStatus(sender);
    } else if (text.indexOf('EXPLORE_AUTO_LOAN') !== -1) {
        params = {};
        utils.exploreAutoLoan(sender);
    } else if (text.indexOf('EXPLORE_HOME_LOAN') !== -1) {
        params = {};
        utils.exploreHomeLoan(sender);
    } else if (text.indexOf('POLICY_OPTION') !== -1) {
        params = {};
        utils.sendHelpMenuCard(sender);
    } else if (text.indexOf('EMAIL_US') !== -1) {
        utils.sendEmailMessageCard(sender);
    } else if (text.indexOf('UNSUBSCRIPTION') !== -1) {
        utils.unsubscribeUser(sender);
    } else if (text.indexOf('REDIRECT_URL') !== -1) {
        utils.redirectConfirmation(sender);
    } else if (text.indexOf('RESET') !== -1) {
        utils.sendReset(sender);

        //BRANCH
    } else if (text.indexOf('BRANCH_LOCATOR') !== -1) {
        params = {};
        params.mode = 'SEARCH_BRANCH';
        branchService.search(sender);
    } else if (text.indexOf('VIEW_ALL_BRANCH') !== -1) {
        branchService.findAll(sender);
    } else if (text.indexOf('SEARCH_BRANCH') !== -1) {
        params = {};
        params.mode = 'SEARCH_BRANCH';
        branchService.search(sender);
    } else if (text.indexOf('VIEW_BRANCH_') !== -1) {
        var id = text.replace('{"payload":"VIEW_BRANCH_', "");
        id = id.replace('"}', "");
        branchService.findBranch(sender, id);
    } else if (text.indexOf('VIEW_MORE_BRANCH_') !== -1) {
        var start_index = text.replace('{"payload":"VIEW_MORE_BRANCH_', "");
        start_index = start_index.replace('"}', "");
        var args = start_index.split("-");
        console.log("CALLING VIEW_MORE_BRANCH_");
        branchService.viewMoreBranches(sender, args[0], args[1]);
    } else if (text.indexOf('VIEW_MORE_BRANCHES_') !== -1) {
        var start_index = text.replace('{"payload":"VIEW_MORE_BRANCHES_', "");
        start_index = start_index.replace('"}', "");
        branchService.viewMoreBranches(sender, start_index);
    } else if (text.indexOf('BRANCH_INFO_') !== -1) {
        var id = text.replace('{"payload":"BRANCH_INFO_', "");
        id = id.replace('"}', "");
        alreadyLog = true;
        branchService.viewBranchInfo(sender, id, function (resp1) {
            details = [];
            details.push(resp1);
            params = {};
            params.sender = sender;
            params.module = logmodule;
            params.action = logaction;
            details.push(params);
            console.log('branch info: ' + JSON.stringify(details));
            utils.sendLogs({
                logtime: new Date(),
                user: sender,
                module: logmodule,
                action: logaction,
                params: details
            });
        });


        //ATMs
    } else if (text.indexOf('ATM_LOCATOR') !== -1) {
        params = {};
        params.mode = 'SEARCH_ATM';
        atmService.search(sender);
    } else if (text.indexOf('VIEW_ALL_ATMS') !== -1) {
        atmService.findAll(sender);
    } else if (text.indexOf('SEARCH_ATM') !== -1) {
        params = {};
        params.mode = 'SEARCH_ATM';
        atmService.search(sender);
    } else if (text.indexOf('VIEW_MORE_ATMS_') !== -1) {
        var start_index = text.replace('{"payload":"VIEW_MORE_ATMS_', "");
        start_index = start_index.replace('"}', "");
        var args = start_index.split("-");
        atmService.viewMoreATMs(sender, args[0], args[1]);
    } else if (text.indexOf('VIEW_ATMS_') !== -1) {
        var id = text.replace('{"payload":"VIEW_ATMS_', "");
        id = id.replace('"}', "");
        atmService.findATM(sender, id);
    } else if (text.indexOf('ATM_INFO_') !== -1) {
        var id = text.replace('{"payload":"ATM_INFO_', "");
        id = id.replace('"}', "");
        atmService.viewATMInfo(sender, id);

        //LOCATIONS
    } else if (text.indexOf('GET_DIRECTIONS_') !== -1) {
        var id = text.replace('{"payload":"GET_DIRECTIONS_', "");
        id = id.replace('"}', "");
        var args = id.split("_");
        var location = args[0];
        var address = args[1];
        var mode = args[2];
        var coordinates = location.split("-");
        alreadyLog = true;
        locationService.getDirections(sender, coordinates, mode, address, function (resp) {
            details = [];
            console.log(JSON.stringify(resp));
            var nmode = resp.mode == "ATM" ? "FIND_AN_ATM" : "FIND_A_BRANCH";
            var skill = {
                name: nmode,
                mode: 'b'
            };
            // console.log(JSON.stringify(skill));
            // details.push(skill);
            details.push(resp);
            params = {};
            params.sender = sender;
            params.module = logmodule;
            params.action = logaction;
            details.push(params);
            console.log('Directions: ' + JSON.stringify(details));
            utils.sendLogs({
                logtime: new Date(),
                user: sender,
                module: logmodule,
                action: logaction,
                skill: skill,
                params: details
            });
        });
    } else if (text.indexOf('FIND_DIRECTIONS_') !== -1) {
        var id = text.replace('{"payload":"FIND_DIRECTIONS_', "");
        id = id.replace('"}', "");
        params = {};
        params.mode = 'FIND_DIRECTIONS';
        params.location = id;
        utils.locationRequest(sender);

        // FOREX Rates
    } else if (text.indexOf('FOREX') !== -1) {
        forexService.sendFOREX(sender);
    } else if (text.indexOf('VIEW_MORE_RATES_') !== -1) {
        var start_index = text.replace('{"payload":"VIEW_MORE_RATES_', "");
        start_index = start_index.replace('"}', "");
        skill = {
            name: "FOREX_RATE",
            mode: 'b'
        };
        forexService.viewMoreRates(sender, start_index);
    } else if (text.indexOf('VIEW_RATES_') !== -1) {
        var id = text.replace('{"payload":"VIEW_RATES_', "");
        id = id.replace('"}', "");
        alreadyLog = true;
        forexService.findRate(sender, id, function (resp) {
            details = [];
            details.push(resp);
            params = {};
            params.sender = sender;
            params.module = logmodule;
            params.action = logaction;
            details.push(params);
            utils.sendLogs({
                logtime: new Date(),
                user: sender,
                module: logmodule,
                action: logaction,
                skill: {
                    name: "FOREX_RATE",
                    mode: 'b'
                },
                params: details
            });
        });

    } else if (text.indexOf('SHOW_ACCOUNT_TYPES') !== -1) {
        accountService.showAccountTypes(sender);

        //Loans   
    } else if (text.indexOf('VIEW_AUTO_LOAN_DETAILS_') !== -1) {
        var option = text.replace('{"payload":"VIEW_AUTO_LOAN_DETAILS_', "");
        option = option.replace('"}', "");
        var args = option.split("-");
        skill = {
            name: 'EXPLORE_AUTO_LOAN',
            mode: 'b'
        };
        details.push(args);
        autoloanService.viewAutoLoanDetails(sender, args);

    } else if (text.indexOf('APPLY_FOR_THIS_LOAN') !== -1) {
        autoloanService.applyforthisLoan(sender);
    } else if (text.indexOf('AUTO_LOAN_CALCULATOR') !== -1) {
        params = {};
        params.mode = 'AUTO_LOAN_CALCULATOR';
        params.step = '1';
        loanService.autoLoanStep1(sender);
    } else if (text.indexOf('VIEW_MORE_BRANDS_') !== -1) {
        var start_index = text.replace('{"payload":"VIEW_MORE_BRANDS_', "");
        start_index = start_index.replace('"}', "");
        loanService.findMoreCarBrands(sender, start_index);
    } else if (text.indexOf('SELECT_BRAND_') !== -1) {
        params.step = '2';
        var brand_name = text.replace('{"payload":"SELECT_BRAND_', "");
        brand_name = brand_name.replace('"}', "");
        loanService.findCarModel(sender, brand_name);
    } else if (text.indexOf('VIEW_MORE_MODELS_') !== -1) {
        var start_index = text.replace('{"payload":"VIEW_MORE_MODELS_', "");
        start_index = start_index.replace('"}', "");
        var args = start_index.split("-");
        loanService.findMoreCarModels(sender, args[0], args[1]);
    } else if (text.indexOf('SELECT_MODEL_') !== -1) {
        params.step = '3';
        var price = text.replace('{"payload":"SELECT_MODEL_', "");
        price = price.replace('"}', "");
        loanService.sendDownPaymentOption(sender, price);

    } else if (text.indexOf('HOME_LOAN_CALCULATOR') !== -1) {
        params = {};
        params.mode = 'HOME_LOAN_CALCULATOR';
        params.step = '1';
        loanService.getLoanAmount(sender);

    } else if (text.indexOf('AUTO_LOAN_FAQS') !== -1) {
        params = {};
        params.mode = 'AUTO_LOAN_FAQS';
        loanService.askMe(sender, "auto");

    } else if (text.indexOf('HOME_LOAN_FAQS') !== -1) {
        params = {};
        params.mode = 'HOME_LOAN_FAQS';
        loanService.askMe(sender, "home");

        //interest rates
    } else if (postback.payload === "CHECK_RATES_REGULAR_SAVINGS") {
        interestService.getInterestRates(sender, "SAREG", "PHP");
    } else if (postback.payload === "CHECK_RATES_DOLLAR_ACCESS") {
        interestService.getInterestRates(sender, "CAUSD", "USD");
    } else if (postback.payload === "CHECK_RATES_CHECKING_SAVINGS") {
        interestService.getInterestRates(sender, "CARET", "PHP");
    } else if (postback.payload === "CHECK_RATES_POWER_CHECKING") {
        interestService.getInterestRates(sender, "CAPWR", "PHP");
        //credit cards
    } else if (text.indexOf('TELL_ME_MORE_GET_GO_GOLD') !== -1) {
        creditCardService.getGOGoldDetails(sender);
    } else if (text.indexOf('TELL_ME_MORE_VISA') !== -1) {
        creditCardService.getVisaDetails(sender);
    } else if (text.indexOf('TELL_ME_MORE_MASTER_CARD') !== -1) {
        creditCardService.getMasterCardDetails(sender);
    } else if (text.indexOf('TELL_ME_MORE_GET_GO_PLATINUM') !== -1) {
        creditCardService.getGOPlatinumDetails(sender);
    } else if (text.indexOf('TELL_ME_MORE_MILES_PALTINUM') !== -1) {
        creditCardService.milesPlatinumDetails(sender);

        // balance inq
    } else if (text.indexOf('BAL_LOGIN_SUCCESS')) {
        balanceInquiryService.displayCreditCards(sender);
    } else if (text.indexOf('VISA_BALANCE_INQUIRY')) {

    } else if (text.indexOf('VISA_TRANSACTION_HISTORY')) {

    } else if (text.indexOf('MCARD_BALANCE_INQUIRY')) {

    } else if (text.indexOf('MCARD_TRANSACTION_HISTORY')) {

    } else if (text.indexOf('AM_EXP_BALANCE_INQUIRY')) {

    } else if (text.indexOf('AM_EXP_TRANSACTION_HISTORY')) {


    } else {
        utils.sendTextMessage(sender, "Function not yet implemented");
    }

    params.sender = sender;
    params.module = logmodule;
    params.action = logaction;
    console.log('Parameters:::' + JSON.stringify(params));
    details.push(params);
    if (!alreadyLog) {
        if (skill != null) {
            utils.sendLogs({
                logtime: new Date(),
                user: sender,
                module: logmodule,
                action: logaction,
                skill: skill,
                params: details
            });
        } else {
            utils.sendLogs({
                logtime: new Date(),
                user: sender,
                module: logmodule,
                action: logaction,
                params: details
            });
        }
    }

    return params;
};