var Vue = new Vue({
    el: "#app",
    data: {
        isloading: false,
        show_step: 1,
        billers: [],
        biller_references: [],
        invalid_biller_msg: [],
        invalid_casa_msg: "",
        invalid_payment_msg: "",
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        biller_details: {
            senderPaymentId: "",
            paymentRequestDate: "",
            biller: {
                id: "",
                name: ""
            },
            amount: {
                currency: "PHP",
                value: ""
            },
            remarks: "",
            particulars: "",
            references: []
        },
        reference_value: {},
        oauth_url: "",
        access_token: "",
        loadReference: false,
        request_data: {},
        sender: "",
        isMasked: {},
        validated_fields: false,
        transaction_id: "",
        mobile: '',
        request_id: "",
        code: "",
        err_msg_otp: ""
    },
    ready: function () {
        this.isloading = true;
        this.sender = this.getUrlVars().sender;
        this.access_token = this.getUrlVars().accessToken;
        this.request_data.log_details = {
            logtime: new Date(),
            user: this.sender,
            module: 'PAY BILLS',
            action: 'PAY BILLS WEBVIEW',
            params: [{
                user: this.sender,
                module: 'PAY BILLS',
                action: 'PAY BILLS WEBVIEW'
            }]
        }

        this.$http.post('/logs', this.request_data.log_details).then((response) => {
        });

        var self = this;
        $('#selectBiller').change(function () {
            self.biller_details.biller.id = $(this).val();
            self.biller_details.biller.name = $("#selectBiller option:selected").text();
            self.biller_details.amount.value = "";
            self.getReference();
            self.validate_fields();
        });

        // this.bindEvent(window, 'message', function (e) {
        //     self.proceedToPayment(e.data);
        // });

        this.updateLogs('Get Billers Information', null);
        this.$http.post('/api/billers', this.request_data)
            .then((response) => {

                if (response.body.errors) {
                    window.location.href = '/err-page';
                } else {
                    this.billers = response.body.billers;
                }

            })
            .then(function () {
                this.isloading = false;
                $('select').material_select();
            });
    },
    computed: {
        reviewDetails: {
            get: function () {
                var data = [];
                Object.keys(this.reference_value).forEach((i) => {
                    Object.keys(this.reference_value[i]).forEach((n) => {
                        data.push({
                            index: i,
                            name: n,
                            value: this.reference_value[i][n]
                        });
                    });
                });
                return data;
            }
        },
        paymentID: {
            get: function () {
                return parseInt(Math.random() * 100000);
            }
        }
    },
    methods: {
        validate_fields: function () {
            var valid = this.biller_details.amount.value != "" &&
                this.biller_details.amount.value > 0;

            for (var i = 0; i < this.biller_details.references.length; i++) {
                if (this.biller_details.references[i].value == "" ||
                    this.biller_details.references[i].value.length < this.biller_references[this.biller_details.references[i].index - 1].min) {
                    valid = false;
                    break;
                }
            }
            console.log('Validate: ' + valid);
            this.validated_fields = valid;
        },
        bindEvent: function (element, eventName, callback) {
            if (element.addEventListener) {
                element.addEventListener(eventName, callback, false);
            } else if (element.attachEvent) {
                element.attachEvent('on' + eventName, callback);
            }
        },
        getUrlVars: function () {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function (m, key, value) {
                    vars[key] = value;
                });
            return vars;
        },
        exit: function () {
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
        updateLogs: function (act, params) {
            var mod = this.request_data.log_details.action;
            this.request_data.log_details.module = mod;
            this.request_data.log_details.params[0].module = mod;
            this.request_data.log_details.action = act;
            this.request_data.log_details.params[0].action = act;
            if (params !== null) this.request_data.details = params;
        },
        updateLogsV2: function (mod, act, params) {
            this.request_data.log_details.module = mod;
            this.request_data.log_details.params[0].module = mod;
            this.request_data.log_details.action = act;
            this.request_data.log_details.params[0].action = act;
            if (params !== null) this.request_data.details = params;
        },
        getReference: function () {
            var validated = true;
            this.loadReference = true;
            if (this.biller_details.biller.id !== "") {
                this.updateLogs('Get Billers Reference', { biller_id: this.biller_details.biller.id });
                this.$http.post('/api/billers/reference', this.request_data)
                    .then((response) => {

                        this.invalid_biller_msg = [];
                        this.biller_references = [];
                        if (response.body.errors) {
                            var err = [];
                            response.body.errors.forEach(msg => {
                                err.push(msg.message);
                            });
                            this.invalid_biller_msg = err;
                        } else {
                            var temp_bill_ref = [];

                            this.biller_references = response.body.references;
                            response.body.references.forEach((ref) => {
                                temp_bill_ref.push({
                                    index: ref.index,
                                    name: ref.name,
                                    value: ""
                                });
                            });
                            this.biller_details.references = temp_bill_ref;
                        }
                    })
                    .then(function () {
                        this.loadReference = false;
                        $('select').material_select();
                    });
            } else {
                console.log('Biller id not found: ' + this.biller_details.biller.id);
                this.loadReference = false;
            }
        },
        changeHeader: function (page) {
            $('ul.tabs li.tab').removeClass("disabled");
            switch (page) {
                case 1: $('#biller-header').click(); break;
                case 2: $('#account-header').click(); break;
                case 3: $('#payment-header').click(); break;
            }
            $('ul.tabs li.tab').addClass("disabled");
        },
        displayValue: function (index, value) {
            var v = value;
            if (this.biller_references[index]) {
                v = "XXXX-XXXX-XXXX-" + value.substring(value.length - 4, value.length);
            }
            return v;
        },
        pay: function () {
            this.isloading = true;
            this.transaction_id = "";
            this.updateLogs('Bills Payment', {
                access_token: this.access_token,
                biller_details: this.biller_details
            });
            this.$http.post('/api/billers/payment', this.request_data)
                .then((resp) => {
                    this.invalid_biller_msg = [];
                    if (!resp.body.errorCode && resp.body.success) {
                        this.transaction_id = resp.body.transaction_id;
                        this.show_step = 4;
                        this.isloading = false;
                    } else if (resp.body.errorCode && resp.body.params && resp.body.params.length > 0) {
                        var arr = [];
                        resp.body.params.forEach(param => {
                            arr.push(param.message);
                        });

                        this.invalid_biller_msg = arr;
                        this.change_step(1);
                    } else if (resp.body.errorCode && resp.body.unauthorized) {
                        this.backToCasa();
                    } else {
                        this.invalid_biller_msg.push(resp.body.message);
                        this.change_step(1);
                    }
                })
                .then(function () {
                    this.isloading = false;
                    $('select').material_select();
                });
        },
        backToCasa: function () {
            window.location.href = '/login-casa?sender=' + this.getUrlVars().sender;
        },
        sendOTP: function () {
            this.isloading = true;
            var validated = this.biller_details.amount.value !== "" && this.biller_details.amount.value > 0;
            this.invalid_casa_msg = "";
            this.invalid_biller_msg = [];
            this.biller_details.references.forEach((ref) => {
                if (ref.value === "") {
                    validated = false;
                }
            });
            if (validated) {
                this.$http.get('/api/otp?number=' + this.mobile).then((result) => {
                    this.request_id = result.body.request_id;
                    this.change_step(2);
                    this.isloading = false;
                });
            } else {
                this.invalid_biller_msg.push("Please fill up all the fields.");
                this.isloading = false;
            }
        },
        verifyOTP: function () {
            this.err_msg_otp = "";
            this.isloading = true;
            if (this.code != "") {
                var args = {
                    request_id: this.request_id,
                    code: this.code
                }
                this.$http.post('/api/otp', args).then((result) => {
                    if (result.body.status == 0) {
                        this.biller_details.paymentRequestDate = new Date();
                        this.biller_details.senderPaymentId = this.paymentID;
                        this.change_step(3);
                    } else {
                        this.err_msg_otp = result.body.error_text;
                    }
                    this.isloading = false;
                });
            } else {
                this.err_msg_otp = "Invalid code";
                this.isloading = false;
            }
        },
        proceedToOAuth: function () {
            this.isloading = true;
            var validated = this.biller_details.amount.value !== "" && this.biller_details.amount.value > 0;
            this.invalid_casa_msg = "";
            this.invalid_biller_msg = [];
            this.biller_details.references.forEach((ref) => {
                if (ref.value === "") {
                    validated = false;
                }
            });
            if (validated) {
                this.oauth_url = 'about:blank';
                if (this.access_token != "") {
                    this.change_step(3);
                    this.isloading = false;
                } else {
                    this.updateLogs('Redirect to oAuth Login', { scope: "payments" });
                    this.$http.post('/oauth/login', this.request_data)
                        .then((resp) => {

                            if (resp.body.errors) {
                                this.invalid_casa_msg = resp.body.errors[0].message;
                            } else {

                                this.oauth_url = resp.body.url;
                                this.change_step(2);

                            }
                        })
                        .then(function () {
                            this.isloading = false;
                            $('select').material_select();
                        });
                }
            } else {
                this.invalid_biller_msg.push("Please fill up all the fields.");
                this.isloading = false;
            }

        },
        proceedToPayment: function () {
            this.updateLogs('Get access token', { code: this.access_token })
            this.$http.post('/oauth/token?code=', this.request_data).then((resp) => {
                this.access_token = resp.body.access_token;
                this.biller_details.paymentRequestDate = new Date();
                this.biller_details.senderPaymentId = this.paymentID;
                this.change_step(3);
            });
        },
        change_step: function (step) {
            this.changeHeader(step);
            this.show_step = step;
        },
        okBtn: function () {
            this.$http.post('/callback', { sender: this.sender, method: 'PAY_BILLS_SUCCESS' }).then((response) => {
                this.exit();
            });
        },
        convertDate: function (json_date) {
            var date = new Date(json_date);
            var dateStr = this.months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
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
        maxlength: function (index, length) {
            if (this.biller_details.references[index - 1].value.length > length) {
                this.biller_details.references[index - 1].value = this.biller_details.references[index - 1].value.slice(0, length);
            }
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