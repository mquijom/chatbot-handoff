(function(d, s, id) {
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
    balance: [],
    account_name: "",
    account_number: "",
    transactions: [],
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ],
    isloading: false,
    request_data: {},
    accessToken: ""
  },
  ready: function() {
    this.init();
  },
  computed: {
    LEDGER: function() {
      return (
        parseFloat(this.balance.FUTBAL) + parseFloat(this.balance.EFFAVLFUTBAL)
      );
    },
    cardNoDisplayed: function() {
      if (this.account_number !== undefined && this.account_number !== "") {
        return this.account_number.substring(
          this.account_number.length - 4,
          this.account_number.length
        );
      } else {
        return "";
      }
    },
    getBalance: function() {
      if (this.balance.errorCode !== undefined) {
        console.log(this.balance.message);
        return "0.00";
      } else {
        var vars = {};
        console.log("bal:::" + JSON.stringify(this.balance));
        this.balance.forEach(bal => {
          vars[bal.type] = bal.amount;
        });
        return vars;
      }
    }
  },
  methods: {
    getUrlVars: function() {
      var vars = {};
      var parts = window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) {
          vars[key] = value;
        }
      );
      return vars;
    },
    init() {
      this.isloading = true;
      var token = this.getUrlVars().token;
      if (token !== undefined) {
        this.$http.post("/token/retrieve", { code: token }).then(resp => {
          console.log(JSON.stringify(resp.body));

          if (resp.body.errorCode !== undefined) {
            window.location.href = "/err-page";
          } else {
            this.sender = resp.body.sender;
            this.accessToken = resp.body.accessToken;
            this.request_data = {
              log_details: {
                logtime: new Date(),
                user: this.sender,
                module: "ACCOUNT_BALANCE_AUTH_VERIFY",
                action: "ACCOUNT_BALANCES",
                params: [
                  {
                    user: this.sender,
                    module: "ACCOUNT_BALANCE_AUTH_VERIFY",
                    action: "ACCOUNT_BALANCES"
                  }
                ]
              },
              details: {
                access_token: this.accessToken
              }
            };
            this.$http
              .post("/api/accounts/details", this.request_data)
              .then(response => {
                console.log("### CASA_DETAILS response: " + JSON.stringify(resp.body));
                if (response.body.errorCode !== undefined) {
                  throw "failed to load card details";
                  window.location.href = "/system-maintenance";
                } else {
                  this.balance = response.body.balances;
                  this.account_name = response.body.name;
                  this.account_number = response.body.accountNumber;

                  this.updateLogs("ACCOUNT_TRANSACTIONS", {
                    access_token: this.accessToken
                  });
                  this.$http
                    .post("/api/accounts/transactions", this.request_data)
                    .then(response => {
                      console.log("### CASA_TRANSACTIONS response: " + JSON.stringify(resp.body));
                      if (response.body.errorCode !== undefined) {
                        window.location.href = "/system-maintenance";
                      } else {
                        console.log(
                          "transactions count: " + response.body.records.length
                        );
                        this.transactions = this.wrapTransactions(
                          response.body.records
                        );
                        this.isloading = false;
                      }
                    });
                }
              });
          }
        });
      } else {
        window.location.href = "/err-page";
      }
    },
    wrapTransactions: function(trans) {
      var wrapByDate = [];
      var mainDt = null;
      var details = [];
      trans.forEach(arr => {
        if (mainDt === null) {
          mainDt = new Date(arr.postDate);
          details.push(arr);
        } else if (
          this.convertDate(mainDt) === this.convertDate(arr.postDate)
        ) {
          details.push(arr);
        } else {
          wrapByDate.push({
            date: mainDt,
            details: details
          });

          details = [];

          mainDt = new Date(arr.postDate);
          details.push(arr);
        }
      });
      if (trans.length !== 0) {
        wrapByDate.push({
          date: mainDt,
          details: details
        });
      }

      wrapByDate.sort(function(a, b) {
        return new Date(a.date) - new Date(b.date);
      });

      wrapByDate.reverse();
      console.log("wrap date::: " + JSON.stringify(wrapByDate));
      return wrapByDate;
    },
    updateLogs: function(act, params) {
      var mod = this.request_data.log_details.action;
      this.request_data.log_details.module = mod;
      this.request_data.log_details.params[0].module = mod;
      this.request_data.log_details.action = act;
      this.request_data.log_details.params[0].action = act;
      if (params !== null) this.request_data.details = params;
    },
    navigateToBillsPayment: function() {
      window.location.href =
        "/billers?sender=" + this.sender + "&token=" + this.accessToken;
    },
    convertCurrency: function(amount) {
      if (amount !== undefined && amount !== "") {
        var negativeSign = amount.toString().includes("-") ? "-" : "";
        var n = Math.abs(parseFloat(amount))
          .toFixed(2)
          .replace(/./g, function(c, i, a) {
            return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
          });
        var num = negativeSign + n.toString();

        if (num === NaN || num === "NaN") {
          return "--";
        }
        return num;
      } else {
        return "--";
      }
    },
    convertDate: function(json_date) {
      var date = new Date(json_date);
      var dateStr =
        this.months[date.getMonth()] +
        " " +
        date.getDate() +
        ", " +
        date.getFullYear();
      return dateStr;
    },
    exit: function() {
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
    }
  }
});

window.extAsyncInit = function() {
  MessengerExtensions.getUserID(
    function success(uids) {
      console.log("########## extension loaded" + JSON.stringify(uids));
    },
    function error(err, errorMessage) {
      // Error handling code
      console.log("########## extension loaded" + errorMessage);
    }
  );
};
