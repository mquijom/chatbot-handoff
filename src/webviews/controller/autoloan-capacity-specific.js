var Vue = new Vue({
    el: '#app',

    data: {
        monthly_income: 0,
        car_brand: "",
        car_model: "",
        budget: "",
        loan_term: "",
        downpayment_amount: 0,
        carBrandList: [],
        carModelList: [],
        user_id: "",
        car_price_budget: "",
        show_no_cars_found: false,
        is_loading: false,
        is_loading_model: false,
        request_data: {}
    },

    computed: {
        downpayment: function () {
            var dp = 0;
            if (this.car_model.srp !== undefined) {
                dp = (this.downpayment_amount / this.car_model.srp) * 100;
            }
            return dp;
        },
        income_price: function () {
            var val = "" + this.monthly_income;
            var display = parseFloat(val.replace(/,/g, ""))
                .toFixed(2)
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return display;
        },
        downpayment_price: function () {
            var val = "" + this.downpayment_amount;
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
        show_brand: function () {
            var result = this.loan_term > 0 && this.carBrandList.length > 0;
            if (!result) {
                this.$set('car_model', "");
                this.$set('show_no_cars_found', false);
            }
            return result;
        },
        show_carmodels: function () {
            return this.carModelList.length > 0;
        },
        show_dp_terms: function () {
            return this.car_model !== "";
        },
        show_dp: function () {
            return this.monthly_income > 0;
        },
        show_terms: function () {
            return this.downpayment_amount > 0;
        },
        show_next: function () {
            return this.car_model !== "";
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
        initLogs('Can I Afford it?', 'Open Capacity Specific Webview', this);
        if (getUrlVars()["monthly_income"] !== undefined) {
            updateLogsv2('Submit the capacity plan', 'Change Something on Capacity Specific', getUrlVars());
            sendLogs({ name: "EXPLORE_AUTO_LOAN", mode: 'a' });
            this.init();
        } else {
            sendLogs({ name: "EXPLORE_AUTO_LOAN", mode: 'a' });
        }
    },

    methods: {
        init: function () {
            this.$set('monthly_income', getUrlVars()["monthly_income"]);
            this.$set('downpayment_amount', getUrlVars()["downpayment_amount"]);
            this.$set('loan_term', getUrlVars()["term"]);
            this.$set('is_loading', true);
            updateLogs('Get Car Brands in Capacity Specific', null);
            this.$http.post('/api/cars/brands', this.request_data).then((response) => {
                this.$set('is_loading', false);
                this.$set('is_loading_model', true);
                this.$set('carBrandList', response.body);
                this.$set('car_brand', getUrlVars()["car_brand"]);
                updateLogs('Get Car Models in Capacity Specific', { brand_name: this.car_brand, price: this.car_price_budget });
                this.$http.post('/api/cars/models', this.request_data).then((response) => {
                    this.$set('carModelList', response.body);
                    var car_code = getUrlVars()["code"];
                    var carModel = this.carModelList.find(function (car) {
                        return car.code === car_code;
                    });

                    this.$set('car_model', carModel);
                    this.$set('is_loading_model', false);
                });
            });
        },
        computePrice: function () {

            var amortization = this.monthly_income / 3;
            var std = 0;
            switch (parseInt(this.loan_term)) {
                case 12:
                    std = 6.56;
                    break;
                case 18:
                    std = 9.19;
                    break;
                case 24:
                    std = 11.30;
                    break;
                case 36:
                    std = 16.82;
                    break;
                case 48:
                    std = 23.20;
                    break;
                case 60:
                    std = 30.26;
                    break;
                default:
                    std = 0;
            }
            var loanable_amount = (amortization * this.loan_term) / (1 + (std / 100));
            var car_price = loanable_amount + this.downpayment_amount;
            //check for 20% dp (minimum) 
            var dp_pct = (this.downpayment_amount / car_price) * 100;
            if (dp_pct < 20) {
                car_price = this.downpayment_amount / 0.2;
            }
            this.$set('car_price_budget', car_price);
            this.$set('car_brand', "");
            this.$set('car_model', "");
            this.getBrands();
        },
        getBrands: function () {
            if (this.loan_term != "") {
                this.$set('is_loading', true);
                this.$set('car_brand', "");
                this.$set('car_model', "");
                this.$set('carModelList', []);
                this.$set('carBrandList', []);
                this.$set('show_no_cars_found', false);
                updateLogs('Get Car Brand by Price in Capacity Specific', { price: this.car_price_budget });
                this.$http.post('/api/cars/brands/prices', this.request_data).then((response) => {
                    this.$set('carBrandList', response.body);
                    this.$set('is_loading', false);
                }, (response) => {
                    console.log("#################Error response: " + response);
                    this.$set('show_no_cars_found', true);
                    this.$set('is_loading', false);
                });
            }
        },
        getModels: function () {
            this.$set('is_loading_model', true);
            updateLogs('Get Car Models in Capacity Specific', { brand_name: this.car_brand, price: this.car_price_budget });
            this.$http.post('/api/cars/models', this.request_data).then((response) => {
                this.$set('car_model', "");
                this.$set('carModelList', response.body);
                if (this.carModelList.length < 1) {
                    this.$set('show_no_cars_found', true);
                } else {
                    this.$set('show_no_cars_found', false);
                }
                this.$set('is_loading_model', false);
            });
        },
        isActiveTerms: function (term) {
            return this.loan_term === term;
        },
        setLoanTerms: function (terms) {
            this.$set('loan_term', terms);
            this.computePrice();
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
                                mode: "AUTOLOAN_CAPACITY_SPECIFIC",
                                zlog: { mod: this.request_data.log_details.action, act: 'Submit the capacity plan' },
                                params: {
                                    car_model: this.car_model, loanTerm: this.loan_term, loanDownPayment: this.downpayment, option: 3,
                                    monthly_income: this.monthly_income, downpayment_amount: this.downpayment_amount,
                                    car_price_budget: this.car_price_budget
                                }
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