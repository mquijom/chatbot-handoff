var Vue = new Vue({
    el: '#app',
    data: {
        car_brand: "",
        car_model: "",
        budget: 0,
        loan_term: "",
        downpayment: "",
        carBrandList: [],
        carModelList: [],
        user_id: "",
        show_no_cars_found: false,
        is_loading: false,
        is_loading_model: false,
        request_data: {}
    },
    computed: {
        budget_price: function () {
            var val = "" + this.budget;
            var display = parseFloat(val.replace(/,/g, ""))
                .toFixed(2)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return display;
        },
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
        show_brand: function () {
            var result = this.budget > 100000 && this.carBrandList.length > 0;
            if (!result) {
                this.$set('car_model', "");
                this.$set('show_no_cars_found', false);
            }
            return result;
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
        initLogs('Start with my budget', 'Open Budget Specific Webview', this);
        if (getUrlVars()["budget"] !== undefined) {
            updateLogsv2('Submit the budget plan', 'Change Something on Budget Specific', getUrlVars());
            sendLogs({ name: "EXPLORE_AUTO_LOAN", mode: 'a' });
            this.init();
        } else {
            sendLogs({ name: "EXPLORE_AUTO_LOAN", mode: 'a' });
        }
    },
    methods: {
        init: function () {
            this.$set('budget', getUrlVars()["budget"]);
            this.$set('is_loading', true);
            updateLogs('Get Car Brands in Budget Specific', null);
            this.$http.post('/api/cars/brands', this.request_data).then((response) => {
                this.$set('is_loading', false);
                this.$set('is_loading_model', true);
                this.$set('carBrandList', response.body);
                this.$set('car_brand', getUrlVars()["car_brand"]);
                updateLogs('Get Car Models in Budget Specific', { brand_name: this.car_brand, price: 0.00 });
                this.$http.post('/api/cars/models', this.request_data).then((response) => {
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
        getUrlVars: function () {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function (m, key, value) {
                    vars[key] = value;
                });
            return vars;
        },
        getBrands: function () {
            this.$set('is_loading', true);
            this.$set('car_brand', "");
            this.$set('car_model', "");
            this.$set('loan_term', "");
            this.$set('downpayment', "");
            this.$set('carModelList', []);
            this.$set('carBrandList', []);
            updateLogs('Get Car Brand by Price in Budget Specific', { price: this.budget });
            this.$http.post('/api/cars/brands/prices', this.request_data).then((response) => {
                this.$set('carBrandList', response.body);
                this.$set('is_loading', false);
            }, (response) => {
                console.log("#################Error response: " + response);
                this.$set('show_no_cars_found', true);
                this.$set('is_loading', false);
            });
        },
        getModels: function () {
            this.$set('is_loading_model', true);
            updateLogs('Get Car Models in Budget Specific', { brand_name: this.car_brand, price: this.budget });
            this.$http.post('/api/cars/models', this.request_data).then((response) => {
                this.$set('is_loading_model', false);
                this.$set('car_model', "");
                this.$set('carModelList', response.body);
                if (this.carModelList.length < 1) {
                    this.$set('show_no_cars_found', true);
                } else {
                    this.$set('show_no_cars_found', false);
                }
            });
        },
        setDownpayment: function (dp) {
            this.$set('downpayment', dp);
        },
        setLoanTerms: function (terms) {
            this.$set('loan_term', terms);
        },
        submit: function () {
            var sender_id = this.user_id;
            if (sender_id === "") {
                sender_id = getUrlVars()["sender"];
            }
            var data = {
                "object": "webview_callback",
                "entry": [{
                    "messaging": [{
                        "sender": { "id": sender_id },
                        "message": {
                            webview_callback: {
                                mode: "AUTOLOAN_BUDGET_SPECIFIC",
                                zlog: { mod: this.request_data.log_details.action, act: 'Submit the budget plan' },
                                params: { car_model: this.car_model, loanTerm: this.loan_term, loanDownPayment: this.downpayment, option: 2, budget: this.budget }
                            }
                        }
                    }]
                }]
            };
            this.$http.post('/webhook', data, { timeout: 0 }).then((response) => {
                closeView();
            });
        }
    }
});

window.extAsyncInit = function () {
    MessengerExtensions.getUserID(function success(uids) {
        vue.$set('user_id', uids.psid);
    });
};   