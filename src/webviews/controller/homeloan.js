(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'Messenger'));

var vue = new Vue({
    el: '#app',
    data: {
        isloading: false,
        contract_price: "",
        loan_dp: "",
        loan_term: "",
        invalid_price: "",
        invalid_dp: "",
        invalid_term: "",
        invalid_message: "",
        monthly_amortization: 0,
        last_action: ""
    },
    computed: {
        contract_price_display: function () {
            var val = "" + this.contract_price;
            var display = parseFloat(val.replace(/,/g, ""))
                .toFixed(2)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return display;
        },
        show_dp_terms: function () {
            return this.car_model !== "";
        },
        show_dp: function () {
            return this.contract_price > 0;
        },
        show_terms: function () {
            return this.loan_dp > 0;
        },
        show_next: function () {
            return this.loan_term !== "";
        },
        active_dp_btn1: function () {
            return this.loan_dp == 20;
        },
        active_dp_btn2: function () {
            return this.loan_dp == 30;
        },
        active_dp_btn3: function () {
            return this.loan_dp == 40;
        },
        active_dp_btn4: function () {
            return this.loan_dp == 50;
        },
        active_dp_btn5: function () {
            return this.loan_dp == 60;
        },
        active_term_btn1: function () {
            return this.loan_term == 60;
        },
        active_term_btn2: function () {
            return this.loan_term == 48;
        },
        active_term_btn3: function () {
            return this.loan_term == 36;
        },
        active_term_btn4: function () {
            return this.loan_term == 24;
        },
        active_term_btn5: function () {
            return this.loan_term == 12;
        }
    },
    ready: function () {
        var self = this;
        $('#loan_dp').change(function () {
            self.loan_dp = $(this).val();
        });

        $('#loan_term').change(function () {
            self.loan_term = $(this).val();
        });

        var log_details = {
            logtime: new Date(),
            user: this.getUrlVars().sender,
            module: 'EXPLORE_HOME_LOAN',
            action: 'EXPLORE_HOME_LOAN_WEBVIEW',
            skill: {
                name: "EXPLORE_HOME_LOAN",
                mode: 'a'
            },
            params: [{
                user: this.getUrlVars().sender,
                module: 'EXPLORE_HOME_LOAN',
                action: 'EXPLORE_HOME_LOAN_WEBVIEW'
            }]
        }

        this.$http.post('/logs', log_details).then((response) => {
            this.last_action = 'EXPLORE_HOME_LOAN_WEBVIEW';
        });
    },
    methods: {
        getUrlVars() {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function (m, key, value) {
                    vars[key] = value;
                });
            return vars;
        },
        submit() {
            this.isloading = true;
            var contract_price_truncate = this.contract_price.replace(/,/g, "").replace('₱ ', '');
            this.monthly_amortization = 0;
            this.invalid_dp = "";
            this.invalid_price = "";
            this.invalid_term = "";
            this.invalid_message = "";
            if (contract_price_truncate == 0 || contract_price_truncate == "") {
                this.invalid_price = "Contract Price is a mandatory field.";
            }

            if (this.loan_dp == 0 || this.loan_dp == "") {
                this.invalid_dp = "Downpayment is a mandatory field.";
            } else if (this.loan_dp < 10 || this.loan_dp > 80) {
                this.invalid_dp = "Downpayment must be in 10% - 80% range.";
            }

            if (this.loan_term == 0 || this.loan_term == "") {
                this.invalid_term = "Loan Term is a mandatory field.";
            } else if (this.loan_term < 1 || this.loan_term > 20) {
                this.invalid_term = "Loan Term must be 1 to 20 years range";
            }

            if (this.invalid_term == "" && this.invalid_dp == "" && this.invalid_price == "") {
                this.$http.post('/api/homeloan/' + this.getUrlVars().sender + '/' + this.last_action, {
                    "dp": this.loan_dp,
                    "term": this.loan_term,
                    "price": contract_price_truncate
                }).then((response) => {
                    this.last_action = 'EXPLORE_HOME_LOAN_CALCULATE';
                    if (response.body.errorCode) {
                        this.invalid_message = response.body.message;
                    } else {
                        this.monthly_amortization = response.body.amortization.monthly;
                    }
                    this.isloading = false;
                });
            }
        },
        convertCurrency(amount) {
            var negativeSign = amount.toString().includes('-') ? "-" : "";
            var n = Math.abs(parseFloat(amount)).toFixed(2).replace(/./g, function (c, i, a) {
                return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
            });
            var num = negativeSign + n.toString();
            return num;
        },
        cancel() {
            MessengerExtensions.requestCloseBrowser(function success() {
                callback();
            }, function error(err) {
                //web close
                window.open('', '_parent', '');
                window.close();
                callback();
            });
        }
    }
});

window.extAsyncInit = function () {
    MessengerExtensions.getUserID(function success(uids) {
        vue.$set('user_id', uids.psid);
    });
};