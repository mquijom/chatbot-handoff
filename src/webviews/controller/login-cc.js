var Vue = new Vue({
    el: "#app",
    data: {
        isloading: false,
        credit_card_number: "",
        card_input: "password",
        icon_input: "visibility_off",
        mask_sign: "X",
        bday: "",
        header: {},
        items: [],
        show_step2: false,
        referenceId: "",
        focusOnCn1: true,
        code_otp: "",
        message_otp: "",
        cn1: "",
        cn2: "",
        cn3: "",
        cn4: "",
        cn5: "",
        cn6: "",
        error_msg: "",
        invalid_msg: "",
        showCardActivation: false,
        invalid_mobile_number: false
    },
    ready: function () {
        var logs = {
            logtime: new Date(),
            user: this.getUrlVars().sender,
            module: 'BALANCE_INQUIRY',
            action: 'OPEN_WEBVIEW_CC_INQUIRY',
            skill: {
                name: 'CC_BALANCE_INQUIRY',
                mode: 'a'
            },
            params: [{
                user: this.getUrlVars().sender,
                module: 'BALANCE_INQUIRY',
                action: 'OPEN_WEBVIEW_CC_INQUIRY'
            }]
        }
        this.$http.post('/logs', logs).then((response) => {

        });
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

            console.log("un-formatted " + this.credit_card_number.replace(/-/g, ''))
        },
        getUrlVars: function () {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function (m, key, value) {
                    vars[key] = value;
                });
            return vars;
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
        next: function () {
            this.isloading = true;
            var data = {
                log_details: {
                    logtime: new Date(),
                    user: this.getUrlVars().sender,
                    module: 'OPEN_WEBVIEW_CC_INQUIRY',
                    action: 'CC_INQUIRY_AUTH',
                    skill: {
                        name: 'CC_BALANCE_INQUIRY',
                        mode: 's'
                    },
                    params: [{
                        user: this.getUrlVars().sender,
                        module: 'OPEN_WEBVIEW_CC_INQUIRY',
                        action: 'CC_INQUIRY_AUTH'
                    }]
                },
                details: {
                    // cardNumber: this.credit_card_number.replace(/-/g, '')
                    cardNumber: this.credit_card_number
                }
            }
            this.$http.post('/authorization', data).then((resp) => {
                if (resp.body.errorCode === undefined) {
                    this.$set('show_step2', true); //cc page
                    this.$set('referenceId', resp.body.referenceId);
                    this.$set('invalid_msg', "");
                    this.$set('invalid_mobile_number', false);
                    this.$set('message_otp', resp.body.message);
                } else if (resp.body.errorCode === '0012') {
                    this.$set('show_step2', false); //cc page
                    this.$set('invalid_mobile_number', true);
                    this.$set('invalid_msg', "");
                } else {
                    this.$set('show_step2', false); //cc page
                    this.$set('invalid_mobile_number', false);
                    // this.$set('invalid_msg', "Invalid Credit Card Number");
                    this.$set('invalid_msg', "Please enter numeric values only.");
                }
                this.isloading = false;
            });

        },
        back: function () {
            this.$set('show_step2', false);
        },
        verify: function () {
            this.isloading = true;
            var data = {
                log_details: {
                    logtime: new Date(),
                    user: this.getUrlVars().sender,
                    module: 'CC_INQUIRY_AUTH',
                    action: 'CC_INQUIRY_AUTH_VERIFY',
                    params: [{
                        user: this.getUrlVars().sender,
                        module: 'CC_INQUIRY_AUTH',
                        action: 'CC_INQUIRY_AUTH_VERIFY'
                    }]
                },
                details: {
                    code: this.code_otp,
                    referenceId: this.referenceId,
                    card_number: this.credit_card_number
                }
            }
            this.$http.post('/authorization/verification', data).then((response) => {
                console.log("###### response:" + JSON.stringify(response.body));

                var results = response.body;
                if (results.accessToken !== undefined && results.accessToken !== "") {
                    console.log("Ok");
                    // success  
                    var data = {
                        url: '/transactions-cc',
                        params: {
                            sender: this.getUrlVars().sender,
                            accessToken: results.accessToken
                        }
                    }
                    this.$http.post('/redirect', data).then((response) => {
                        window.location.href = response.body;
                    });

                } else {
                    // error
                    console.log("Error");
                    this.$set('error_msg', results.message);
                    this.$set('message_otp', "");
                    this.isloading = false;
                }

            });
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
        },
        masked: function (masked_value, value) {
            for (var i = 0; i < masked_value.length; i++) {
                if (masked_value.charAt(i) != this.mask_sign) {
                    value += masked_value.charAt(i);
                    masked_value = this.setCharAt(masked_value, i, this.mask_sign);
                }
            }
            if (value.length > masked_value.length) {
                value = value.slice(0, masked_value.length);
            }
            console.log(value + ":" + masked_value);
            return {
                value: value,
                masked_value: masked_value
            };
        },
        cardActivation: function () {
            window.location.href = "/card-activation?sender=" + this.getUrlVars().sender;
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