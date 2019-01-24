var Vue = new Vue({
    el: "#app",
    data: {
        isloading: false,
        credit_card_number: "",
        card_input: "password",
        icon_input: "visibility_off",
        expiry_mm: "",
        expiry_yy: "",
        bday: "",
        bday_dd: "",
        bday_mm: "",
        bday_yy: "",
        header: {},
        items: [],
        show_step1: true,
        show_step2: false,
        show_step3: false,
        request_id: "",
        otp: "",
        error_msg: "",
        invalid_msg: "",
        invalid_cc: false,
        invalid_exp: false,
        invalid_bday: false,
        invalid_otp: false,
        fname: "",
        mobile_no: ""
    },
    ready: function () {
        var log_details = {
            logtime: new Date(),
            user: this.getUrlVars().sender,
            module: 'CARD_ACTIVATION',
            action: 'CARD_ACTIVATION_WEBVIEW',
            skill: {
                name: "CC_ACTIVATION",
                mode: 'a'
            },
            params: [{
                user: this.getUrlVars().sender,
                module: 'CARD_ACTIVATION',
                action: 'CARD_ACTIVATION_WEBVIEW'
            }]
        }
        this.$http.post('/logs', log_details).then((response) => {});


    },
    methods: {
        hide_show() {
            console.log("HIDE_SHOW RESP..." + this.card_input)
            if (this.card_input === "text") {
                this.card_input = "password"
                this.icon_input = "visibility_off"
            } else if (this.card_input === "password") {
                this.card_input = "text"
                this.icon_input = "visibility"
            }
            console.log("HIDE_SHOW RESP..." + this.card_input)
        },
        formatCC() {
            console.log("formatting..." + this.credit_card_number.length)
            if (this.credit_card_number.length === 4 ||
                this.credit_card_number.length === 9 ||
                this.credit_card_number.length === 14) {
                this.credit_card_number = this.credit_card_number + "-"
            }

            if (this.credit_card_number.length > 19) {
                this.credit_card_number = this.credit_card_number.substring(0, 19)
            }

            console.log("un-formatted " + this.credit_card_number.replace(/\s/g, ''))
        },
        getUrlVars: function () {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function (m, key, value) {
                    vars[key] = value;
                });
            return vars;
        },
        validateMM: function () {
            if (this.expiry_mm > 12) {
                this.expiry_mm = 12;
            } else if (this.expiry_mm < 1) {
                this.expiry_mm = '';
            }
        },
        validateYY: function () {
            if (this.expiry_yy > 99) {
                this.expiry_yy = 99;
            } else if (this.expiry_yy < 0) {
                this.expiry_yy = '';
            }
        },
        cancel: function () {
            MessengerExtensions.requestCloseBrowser(function success() {
                callback();
            }, function error(err) {
                console.log("closing......");
                //web close
                window.open('', '_parent', '');
                window.close();
                //ios
                open(location, '_self').close();
                callback();
            });
        },
        formatExpiry: function (expiry) {
            return expiry.length == 2 || expiry > 9 ? expiry : "0" + expiry;
        },
        check_details: function () {
            this.isloading = true;
            console.log('bday: ' + this.bday);
            // this.bday = (this.bday_mm + "/" + this.bday_dd + "/" + this.bday_yy);
            var card_details = {
                "card": {
                    // "number": this.credit_card_number.replace(/-/g, ''),
                    "number": this.credit_card_number,
                    "expiryDate": this.formatExpiry(this.expiry_mm) + '/' + this.formatExpiry(
                        this.expiry_yy)
                },
                "birthDate": this.formatDate(this.bday_mm + this.bday_dd + this.bday_yy)
            }
            var data = {
                log_details: {
                    logtime: new Date(),
                    user: this.getUrlVars().sender,
                    module: 'CARD_ACTIVATION_WEBVIEW',
                    action: 'CC_ACTIVATION_SUBMIT',
                    skill: {
                        name: "CC_ACTIVATION",
                        mode: 's'
                    },
                    params: [{
                        user: this.getUrlVars().sender,
                        module: 'CARD_ACTIVATION_WEBVIEW',
                        action: 'CC_ACTIVATION_SUBMIT'
                    }]
                },
                details: {
                    card_details: card_details
                }
            }
            this.$http.post('/api/card/activation', data).then((response) => {

                console.log("######## res:" + response.body);

                if (response.body.errorCode) {
                    this.$set('invalid_msg', response.body.message);
                    this.isloading = false;
                } else {
                    this.show_step1 = false;
                    this.show_step2 = true;
                    this.isloading = false;
                    //set mobile number ending

                    this.request_id = response.body.referenceId;
                }

            });
        },
        formatDate: function (date) {
            console.log('bday: ' + date);
            var dt = new Date(date);
            var m = dt.getMonth() + 1;
            var month = m > 9 ? m : "0" + m;
            var d = dt.getDate() > 9 ? dt.getDate() : "0" + dt.getDate();

            var newDt = dt.getFullYear() + "-" + month + "-" + d;
            console.log('bday: ' + newDt);
            return newDt;
        },
        back: function () {
            this.$set('show_step2', false);
        },
        next: function () {
            var validated = true;
            this.invalid_cc = false;
            this.invalid_exp = false;
            this.invalid_bday = false;
            //check fields
            if (this.credit_card_number === "") {
                this.invalid_cc = true;
                validated = false;
            }
            if (this.expiry_mm === "" || this.expiry_yy === "") {
                this.invalid_exp = true;
                validated = false;
            }

            if (this.bday_mm === "" || this.bday_dd === "" || this.bday_yy === "") {
                this.invalid_bday = true;
                validated = false;
            }

            if (validated) {
                this.check_details();
            }
        },
        verify: function () {
            this.isloading = true;
            this.$set('error_msg', '');
            if (!this.otp) {
                this.$set('error_msg', 'Please enter your One-Time Password');
                this.isloading = false;
            } else {
                var otp_details = {
                    "code": this.otp,
                    "referenceId": this.request_id
                };

                var data = {
                    log_details: {
                        logtime: new Date(),
                        user: this.getUrlVars().sender,
                        module: 'CC_ACTIVATION_SUBMIT',
                        action: 'CC_ACTIVATION_OTP',
                        params: [{
                            user: this.getUrlVars().sender,
                            module: 'CC_ACTIVATION_SUBMIT',
                            action: 'CC_ACTIVATION_OTP'
                        }]
                    },
                    details: {
                        card_number: this.credit_card_number,
                        otp_details: otp_details
                    }
                }

                this.$http.post('/api/card/activation/otp', data).then((response) => {
                    if (response.body.errorCode) {
                        this.$set('error_msg', response.body.message);
                        this.isloading = false;
                    } else {
                        this.show_step2 = false;
                        this.show_step3 = true;
                        this.isloading = false;
                        var log_details = {
                            logtime: new Date(),
                            user: this.getUrlVars().sender,
                            module: 'CC_ACTIVATION_OTP',
                            action: 'CARD_ACTIVATION_SUCCESS',
                            params: [{
                                user: this.getUrlVars().sender,
                                module: 'CC_ACTIVATION_OTP',
                                action: 'CARD_ACTIVATION_SUCCESS'
                            }]
                        }
                        this.$http.post('/logs', log_details).then((response) => {});
                    }
                });
            }
        },
        convertDate: function (json_date) {
            var date = new Date(json_date);
            var dateStr = (date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear());
            return dateStr;
        },
        convertCurrency: function (amount) {
            var negativeSign = amount.toString().includes('-') ? "-" : "";
            var n = Math.abs(parseInt(amount)).toFixed(2).replace(/./g, function (c, i, a) {
                return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
            });
            var num = negativeSign + n.toString();
            return num;
        }
    }
})
window.extAsyncInit = function () {

    MessengerExtensions.getUserID(function success(uids) {
        console.log("########## extension loaded" + JSON.stringify(uids));
    }, function error(err, errorMessage) {
        // Error handling code
        console.log("########## extension loaded" + errorMessage);

    });

};