var utils = require('../utils/utils.js');
var common = require('../utils/constants.js');

var atmService = require('../services/atmService.js');
var branchService = require('../services/branchService.js');
var forexService = require('../services/forexService.js');
var interestService = require('../services/interestService.js');
var loanService = require('../services/loanService.js');
var autoloanService = require('../services/autoLoanService.js');
var homeloanService = require('../services/homeLoanService.js');
var accountService = require('../services/accountService.js');
var creditCardService = require('../services/creditCardService.js');
var accountBalances = require('../services/accountBalances.js');

var balanceInquiryService = require('../services/balanceInquiryService.js');
var cardActivation = require('../services/cardActivation.js');
var gsisActivation = require('../services/gsisActivation.js');
var payBills = require('../services/payBillsService.js');
var checkWriterService = require('../services/checkWriterService.js');
var updateContactsService = require('../services/updateContactsService.js');
var cardlessService = require('../services/cardlessService.js');

exports.processRequest = function (sender, payload, params, text) {
    console.log("####### quick_reply payload: " + payload);
    var logmodule = params.action;
    var logaction = text;
    var details = [];
    var skill = null;
    if (payload.indexOf('INQUIRY_MENU') !== -1) {
        params = {};
        var messages = [{
            "text": "Alright ! What card do you want to check?",
            "quick_replies": common.inquiryQuickReplies()
        }]
        utils.sendSeriesMessages(sender, messages);
    } else if (payload.indexOf('ACTIVATION_MENU') !== -1) {
        params = {};
        var messages = [{
            "text": "Got it ! What do you want to activate?",
            "quick_replies": common.activateQuickReplies()
        }]
        utils.sendSeriesMessages(sender, messages);
    } else if (payload.indexOf('ATM_BRANCH_LOCATOR') !== -1) {
        params = {};
        var messages = [{
            "text": "Okay ! What do you want to find?",
            "quick_replies": common.atmOrBranch()
        }]
        utils.sendSeriesMessages(sender, messages);
    } else if (payload.indexOf('AUTO_HOME_LOAN') !== -1) {
        params = {};
        var messages = [{
            "text": "Okay ! What do you want to find?",
            "quick_replies": common.autoOrHome()
        }]
        utils.sendSeriesMessages(sender, messages);
    } else if (payload.indexOf('MAIN_MENU') !== -1) {
        params = {};
        utils.sendReset(sender);
    } else if (payload.indexOf('BALANCE_INQUIRY') !== -1) {
        params = {};
        balanceInquiryService.balanceInquiry(sender);
    } else if (payload.indexOf('ACCOUNT_BALANCES') !== -1) {
        params = {};
        accountBalances.getBalances(sender);

    } else if (payload.indexOf('CARD_ACTIVATION') !== -1) {
        params = {};
        cardActivation.activateCard(sender);

    } else if (payload.indexOf('CARDLESS_WITHDRAWAL') !== -1) {
        params = {};
        cardless.activatecardless(sender);

    } else if (payload.indexOf('GSIS_ACTIVATION') !== -1) {
        params = {};
        gsisActivation.activateGSIS(sender);

    } else if (payload.indexOf('CHECK_WRITER') !== -1) {
        params = {};
        checkWriterService.checkStatus(sender);

    } else if (payload.indexOf('UPDATE_CONTACT') !== -1) {
        params = {};
        updateContactsService.updateContacts(sender);

    } else if (payload.indexOf('PAY_BILLS') !== -1) {
        params = {};
        payBills.sendPayBills(sender);

        //FOREX
    } else if (payload.indexOf('FOREX_RATE') !== -1) {
        skill = {
            name: "FOREX_RATE",
            mode: 'b'
        };
        forexService.sendFOREX(sender);
    } else if (payload.indexOf('VIEW_ALL_FOREX') !== -1) {
        skill = {
            name: "FOREX_RATE",
            mode: 'b'
        };
        forexService.forexServiceCard(sender);

        //BRANCH    
    } else if (payload.indexOf('BRANCH_LOCATOR') !== -1) {
        params = {};
        params.mode = 'SEARCH_BRANCH';
        branchService.search(sender);
    } else if (payload.indexOf('VIEW_ALL_BRANCH') !== -1) {
        branchService.findAll(sender);

        //ATMs    
    } else if (payload.indexOf('ATM_LOCATOR') !== -1) {
        params = {};
        params.mode = 'SEARCH_ATM';
        atmService.search(sender);
    } else if (payload.indexOf('VIEW_ALL_ATMS') !== -1) {
        atmService.findAll(sender);

        //ACCOUNTS
    } else if (payload.indexOf('OPEN_AN_ACCOUNT') !== -1) {
        accountService.openAnAccount(sender);

        //CREDIT_CARDS
    } else if (payload.indexOf('FIND_A_CREDIT_CARD') !== -1) {
        creditCardService.findACreditCard(sender);

    } else if (payload.indexOf('LIST_CREDIT_CARD_TRAVEL') !== -1) {
        // skill = { name: "FIND_A_CREDIT_CARD", mode: 'b' };
        creditCardService.listCreditCardTravel(sender);

    } else if (payload.indexOf('LIST_CREDIT_CARD_REWARDS') !== -1) {
        // skill = { name: "FIND_A_CREDIT_CARD", mode: 'b' };
        creditCardService.listCreditCardRewards(sender);

    } else if (payload.indexOf('LIST_CREDIT_CARD_CASHBACK') !== -1) {
        // skill = { name: "FIND_A_CREDIT_CARD", mode: 'b' };
        creditCardService.listCreditCardCashback(sender);

    } else if (payload.indexOf('CC_APPLICATION_STATUS') !== -1) {
        creditCardService.creditCardApplicationStatus(sender);

    } else if (payload.indexOf('CC_APPLICATION') !== -1) {
        creditCardService.listCreditCardApplication(sender);
        //LOANS
    } else if (payload.indexOf('EXPLORE_AUTO_LOAN') !== -1) {
        autoloanService.exploreAutoLoan(sender);

    } else if (payload.indexOf('CAR_LOAN_STEP1_OPTION1') !== -1) {
        autoloanService.carLoanStep1Option1(sender);

    } else if (payload.indexOf('CAR_LOAN_STEP1_OPTION2') !== -1) {
        autoloanService.carLoanStep1Option2(sender);

    } else if (payload.indexOf('CAR_LOAN_STEP1_OPTION3') !== -1) {
        autoloanService.carLoanStep1Option3(sender);

    } else if (payload.indexOf('APPLY_FOR_THIS_LOAN') !== -1) {
        autoloanService.applyforthisLoan(sender);

    } else if (payload.indexOf('LOAN_MAIN') !== -1) {
        loanService.sendLoanMenu(sender);

    } else if (payload.indexOf('AUTO_LOAN_STEP1_YES') !== -1) {
        loanService.autoLoanStep2Yes(sender);

    } else if (payload.indexOf('AUTO_LOAN_STEP1_NO') !== -1) {
        loanService.findCarBrands(sender);

    } else if (payload.indexOf('AUTO_LOAN_DOWNPAYMENT_') !== -1) {
        var args = payload.replace('AUTO_LOAN_DOWNPAYMENT_', "");
        args = args.split("-");
        loanService.sendTermsOption(sender, args);

    } else if (payload.indexOf('AUTO_LOAN_TERMS_') !== -1) {
        var args = payload.replace('AUTO_LOAN_TERMS_', "");
        args = args.split("-");
        loanService.computeAutoLoan(sender, args);

        //clear mode
        params = {};

    } else if (payload.indexOf('AUTO_LOAN_APPLICATION_YES') !== -1) {
        loanService.sendAutoApplicationForm(sender);

        //interest rates
    } else if (payload === "INTEREST_RATES") {
        interestService.interestRateCard(sender);
    } else if (payload === "INTEREST_RATES_2") {
        interestService.interestRateList(sender);
    } else if (payload === "INTREST_RATE_SAVINGS") {
        interestService.interestRateSavingsCard(sender);
    } else if (payload === "INTEREST_RATE_CHECKING") {
        interestService.interestRateCheckingCard(sender);

    } else if (payload === "CHECK_RATES_REGULAR_SAVINGS") {
        interestService.getInterestRates(sender, "SAREG", "PHP");

        // home loan 
    } else if (payload.indexOf('EXPLORE_HOME_LOAN') !== -1) {
        homeloanService.exploreHomeLoan(sender);

    } else if (payload.indexOf('HOME_LOAN_CALCULATOR') !== -1) {
        params = {};
        params.mode = 'HOME_LOAN_CALCULATOR';
        params.step = '1';
        loanService.getLoanAmount(sender);

    } else if (payload.indexOf('HOME_LOAN_RATE_') !== -1) {
        var args = payload.replace('HOME_LOAN_RATE_', "");
        args = args.split("-");
        loanService.getLoanTerms(sender, args);
        params.rate = args[0];
        params.step = "3";
    } else if (payload.indexOf('HOME_LOAN_APPLICATION_YES') !== -1) {
        loanService.sendHomeApplicationForm(sender);
        //FAQs   
    } else if (payload.indexOf('FAQS') !== -1) {
        utils.sendFAQCard(sender);

        //Complaints/issues    
    } else if (payload.indexOf('COMPLAINT_ISSUES') !== -1) {
        params = {};
        params.mode = 'COMPLAINT_ISSUES';
        params.step = '1';
        utils.sendTextMessage(sender, "Please reply with your complaints and issues.");
    } else if (payload.indexOf('SEND_COMPLAINT') !== -1) {
        params = {};
        utils.sendEndComplaintCard(sender);

        //OTHERs
    } else if (payload.indexOf('MENU') !== -1) {
        params = {};
        utils.sendWelcomeMessage(sender);
    } else if (payload.indexOf('EMAIL_US') !== -1) {
        utils.sendEmailMessageCard(sender);
    } else if (payload.indexOf('CALL_US') !== -1) {
        utils.sendCallMessageCard(sender);
    } else if (payload.indexOf('RESET') !== -1) {
        params = {};
        utils.sendReset(sender);
    } else if (payload.indexOf('REDIRECT_URL') !== -1) {
        utils.redirectConfirmation(sender);
        //BALANCE_INQUIRY
    }

    params.module = logmodule;
    params.action = logaction;
    params.sender = sender;
    console.log('Parameters:::' + JSON.stringify(params));
    details.push(params);
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

    return params;
};