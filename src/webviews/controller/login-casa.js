(function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "Messenger");

var Vue = new Vue({
  el: "#app",
  data: {
    sender: "",
    account_number: "",
    referenceId: "",
    otp: "",
    request_data: {},
    show_step2: false,
    accessToken: ""
  },
  ready: function () {
    this.sender = this.getUrlVars().sender;
    var self = this;

    this.request_data.log_details = {
      logtime: new Date(),
      user: this.sender,
      module: "ACCOUNT BALANCES",
      action: "ACCOUNT BALANCES WEBVIEW",
      params: [{
        user: this.sender,
        module: "ACCOUNT BALANCES",
        action: "ACCOUNT BALANCES WEBVIEW"
      }]
    };

    this.$http.post("/logs", this.request_data.log_details).then(response => {
      // console.log(JSON.stringify(response.status));
    });
    // this.updateLogs("Redirect to oAuth Login", { scope: "account_balances" });
  },
  methods: {
    getUrlVars: function () {
      var vars = {};
      var parts = window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
          vars[key] = value;
        }
      );
      return vars;
    },
    exit: function () {
      MessengerExtensions.requestCloseBrowser(
        function success() {
          callback();
        },
        function error(err) {
          console.log("closing......");
          //web close
          window.open("", "_parent", "");
          window.close();
          //ios
          open(location, "_self").close();
          callback();
        }
      );
    },
    updateLogs: function (act, params) {
      var mod = this.request_data.log_details.action;
      this.request_data.log_details.module = mod;
      this.request_data.log_details.params[0].module = mod;
      this.request_data.log_details.action = act;
      this.request_data.log_details.params[0].action = act;
      if (params !== null) this.request_data.details = params;
    },
    next() {
      if (this.account_number !== "") {
        this.$http
          .post("/api/accounts/authorization", {
            accountNumber: this.account_number
          })
          .then(resp => {
            console.log("### CASA_AUTH response: " + JSON.stringify(resp.body));
            if (resp.body.errorCode === undefined) {
              this.referenceId = resp.body.referenceId;
              this.show_step2 = true;
              this.$set('invalid_msg', "");
            } else {
              this.show_step2 = false;
              this.$set('invalid_msg', "Invalid Account Number");
            }
            this.isloading = false;
          });
      } else {
        this.show_step2 = false;
        this.$set('invalid_msg', "Account Number is mandatory");
      }
    },
    verify() {
      if (this.otp !== "") {
        this.$http
          .post("/api/accounts/authorization/verification", {
            code: this.otp,
            referenceId: this.referenceId
          })
          .then(resp => {
            console.log("### CASA_VERIF response: " + JSON.stringify(resp.body));
            if (resp.body.errorCode === undefined) { // true
              this.referenceId = resp.body.referenceId;
              this.$set('invalid_msg', "");
              var data = {
                url: "/casa-transactions",
                params: {
                  sender: this.getUrlVars().sender,
                  accessToken: resp.body.accessToken
                }
              };
              this.$http.post("/redirect", data).then(response => {
                window.location.href = response.body;
              });
            } else { // if fields incorrect OTP
              this.show_step2 = true;
              this.$set('invalid_msg', "Invalid OTP Number");
            }
            this.isloading = false;
          });
      } else { //if field is blank
        this.show_step2 = true;
        this.$set('invalid_msg', "OTP Number is required");
      }
    }
  }
});

window.extAsyncInit = function () {
  MessengerExtensions.getUserID(
    function success(uids) {
      console.log("########## extension loaded" + JSON.stringify(uids));
  //     messages.push({
  //   text: "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal."
  // });
    },
    function error(err, errorMessage) {
      // Error handling code
      console.log("########## extension loaded" + errorMessage);
    }
  );
};