var Vue = new Vue({
    el: '#app',
    data: {
        car_brand: "",
        car_model: "",
        downpayment: "",
        loan_term: "",
        carBrandList: [],
        carModelList: [],
        carAutoLoan: [],
        loan_computation: {},
        user_id: "",
        is_loading: false,
        is_loading_model: false,
        request_data: {}
    },
    computed: {
        car_price: function () {
            var display = "0.00"
            if (this.car_model) {
                display = parseFloat(this.car_model.srp.toString().replace(/,/g, ""))
                    .toFixed(2)
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            }
            return display;
        },
        downpayment_price: function () {
            var dp = this.car_model.srp * (this.downpayment / 100);
            var display = "" + dp;
            var display = parseFloat(display.replace(/,/g, ""))
                .toFixed(2)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return display;
        },
        car_unit: function () {
            return this.car_model.name;
        },
        show_brand: function () {
            return this.carBrandList.length > 0;
        },
        show_carmodels: function () {
            return this.carModelList.length > 0;
        },
        show_dp: function () {
            return this.car_model !== "";
        },
        show_terms: function () {
            return this.downpayment !== "";
        },
        show_next: function () {
            return this.loan_term !== "";
        },
        active_dp_btn1: function () {
            return this.downpayment == 20;
        },
        active_dp_btn2: function () {
            return this.downpayment == 30;
        },
        active_dp_btn3: function () {
            return this.downpayment == 40;
        },
        active_dp_btn4: function () {
            return this.downpayment == 50;
        },
        active_dp_btn5: function () {
            return this.downpayment == 60;
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
        initLogs('i have a car in mind', 'Open Car Specific Webview', this);
        if (getUrlVars()["car_brand"] !== undefined) {
            updateLogsv2('Submit the Chosen Car', 'Change Something on Car Specific', getUrlVars());
            sendLogs({ name: "EXPLORE_AUTO_LOAN", mode: 'a' });
            this.init();
        } else {
            sendLogs({ name: "EXPLORE_AUTO_LOAN", mode: 'a' });
            this.getBrands();
        }

    },
    methods: {
        init: function () {
            this.$set('is_loading', true);
            updateLogs('Get Car Brands in Car Specific', null);
            this.$http.post('/api/cars/brands', this.request_data).then((response) => {
                this.$set('carBrandList', response.body);
                this.$set('car_brand', getUrlVars()["car_brand"]);
                this.$set('is_loading', false);
                this.$set('is_loading_model', true);
                updateLogs('Get Car Models in Car Specific', { brand_name: this.car_brand, price: 0.00 });
                this.$http.post('/api/cars/models', this.request_data).then((response) => {
                    this.$set('loan_computation', {});
                    this.$set('carModelList', response.body);
                    var car_code = getUrlVars()["code"];
                    var carModel = this.carModelList.find(function (car) {
                        return car.code === car_code;
                    });
                    this.$set('car_model', carModel);

                    this.$set('downpayment', getUrlVars()["dp"]);
                    this.$set('loan_term', getUrlVars()["term"]);
                    this.$set('is_loading_model', false);
                });
            });
        },
        getBrands: function () {
            this.$set('is_loading', true);
            updateLogs('Get Car Brands in Car Specific', null);
            this.$http.post('/api/cars/brands', this.request_data).then((response) => {
                this.$set('is_loading', false);
                this.$set('carBrandList', response.body);

            });
        },
        getModels: function () {
            this.$set('is_loading_model', true);
            updateLogs('Get Car Models in Car Specific', { brand_name: this.car_brand, price: 0.00 });
            this.$http.post('/api/cars/models', this.request_data).then((response) => {
                this.$set('car_model', "");
                this.$set('loan_computation', {});
                this.$set('carModelList', response.body);
                this.$set('is_loading_model', false);
            });
        },
        setDownpayment: function (dp) {
            this.$set('downpayment', dp);
        },
        setLoanTerms: function (terms) {
            this.$set('loan_term', terms);
        },
        getComputation: function () {
            updateLogs('Compute Autoloan', { price: this.car_price, loanTerm: this.loan_term, loanDownPayment: this.downpayment });
            this.$http.post('/api/cars/loans', this.request_data).then((response) => {
                this.$set('loan_computation', response.body);
            });
        },
        submit: function () {
            var sender_id = this.user_id;
            if (sender_id === "") {
                sender_id = getUrlVars()["sender"]
            }
            var data = {
                "object": "webview_callback",
                "entry": [{
                    "messaging": [{
                        "sender": { "id": sender_id },
                        "message": {
                            webview_callback: {
                                mode: "AUTOLOAN_CAR_SPECIFIC",
                                zlog: { mod: this.request_data.log_details.action, act: 'Submit the Chosen Car' },
                                params: { car_model: this.car_model, loanTerm: this.loan_term, loanDownPayment: this.downpayment, option: 1 }
                            }
                        }
                    }]
                }]
            };

            this.$http.post('/webhook', data, { timeout: 0 }).then((response) => {
                MessengerExtensions.requestCloseBrowser(function success() {
                    callback();
                }, function error(err) {
                    //web close
                    window.open('', '_parent', '');
                    window.close();
                    callback();
                });
            });

        }
    }
});

window.extAsyncInit = function () {
    MessengerExtensions.getUserID(function success(uids) {
        vue.$set('user_id', uids.psid);
    });
};