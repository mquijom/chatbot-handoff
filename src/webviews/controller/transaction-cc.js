var Vue = new Vue({
    el: "#app",
    data: {
        sender: '',
        cif: [],
        balance: [],
        balances: {},
        statement_header: [],
        statement_transactions: [],
        unbilled: [],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        doneLoading: false
    },
    ready: function () {
        var token = this.getUrlVars().token;
        if (token !== undefined) {
            this.$http.post('/token/retrieve', {
                code: token
            }).then((resp) => {
                console.log(JSON.stringify(resp.body));

                if (resp.body.errorCode !== undefined) {
                    window.location.href = '/err-page';
                } else {
                    this.sender = resp.body.sender;
                    var accessToken = resp.body.accessToken;
                    try {
                        var data = {
                            log_details: {
                                logtime: new Date(),
                                user: this.sender,
                                module: 'CC_INQUIRY_AUTH_VERIFY',
                                action: 'CC_INQUIRY_CARD_DETAILS',
                                params: [{
                                    user: this.sender,
                                    module: 'CC_INQUIRY_AUTH_VERIFY',
                                    action: 'CC_INQUIRY_CARD_DETAILS'
                                }]
                            },
                            details: {
                                access_token: accessToken
                            }
                        }
                        this.$http.post('/cards/details', data).then((response) => {
                            this.$set('cif', response.body);

                            if (this.cif.errorCode !== undefined) {
                                window.location.href = '/system-maintenance';
                                throw 'failed to load card details';
                            }

                            data.log_details.module = 'CC_INQUIRY_CARD_DETAILS';
                            data.log_details.action = 'CC_INQUIRY_STATEMENT_HEADER';
                            data.log_details.params[0].module = 'CC_INQUIRY_CARD_DETAILS';
                            data.log_details.params[0].action = 'CC_INQUIRY_STATEMENT_HEADER';
                            this.$http.post('/cards/statement_header', data).then((response3) => {
                                this.$set('statement_header', response3.body);

                                if (this.statement_header.errorCode !== undefined) {
                                    console.log('statement header error: ' + this.statement_header)
                                    window.location.href = '/system-maintenance';
                                    throw 'failed to load card statement header';
                                }

                                data.log_details.module = 'CC_INQUIRY_STATEMENT_HEADER';
                                data.log_details.action = 'CC_INQUIRY_STATEMENT_TRANS';
                                data.log_details.params[0].module = 'CC_INQUIRY_STATEMENT_HEADER';
                                data.log_details.params[0].action = 'CC_INQUIRY_STATEMENT_TRANS';
                                this.$http.post('/cards/statement_transactions', data).then((response4) => {
                                    this.$set('statement_transactions', response4.body);


                                    if (this.statement_transactions.errorCode !== undefined) {
                                        window.location.href = '/system-maintenance';
                                        throw 'failed to load card statement transactions';
                                    } else {
                                        // this.statement_transactions.reverse();
                                    }
                                    data.log_details.module = 'CC_INQUIRY_STATEMENT_TRANS';
                                    data.log_details.action = 'CC_INQUIRY_UNBILLED_TRANS';
                                    data.log_details.params[0].module = 'CC_INQUIRY_STATEMENT_TRANS';
                                    data.log_details.params[0].action = 'CC_INQUIRY_UNBILLED_TRANS';
                                    this.$http.post('/cards/unbilled', data).then((response5) => {
                                        this.$set('unbilled', response5.body);

                                        if (this.unbilled.errorCode !== undefined) {
                                            window.location.href = '/system-maintenance';
                                            throw 'failed to load unbilled transactions';
                                        } else {
                                            // this.unbilled.reverse();
                                        }

                                        if (this.cif.type !== 'S') {
                                            data.log_details.module = 'CC_INQUIRY_UNBILLED_TRANS';
                                            data.log_details.action = 'CC_INQUIRY_CARD_BALANCES';
                                            data.log_details.params[0].module = 'CC_INQUIRY_UNBILLED_TRANS';
                                            data.log_details.params[0].action = 'CC_INQUIRY_CARD_BALANCES';
                                            this.$http.post('/cards/balances', data).then((response2) => {
                                                this.$set('balance', response2.body);

                                                if (this.balance.errorCode !== undefined) {
                                                    window.location.href = '/system-maintenance';
                                                    throw 'failed to load card balances';
                                                }

                                                this.doneLoading = true;
                                            });
                                        } else {
                                            this.doneLoading = true;
                                        }
                                    });
                                });
                            });
                        });
                    } catch (err) {
                        console.log(err);
                        window.location.href = '/system-maintenance';
                    }
                }
            });
        } else {
            window.location.href = '/err-page';
        }
    },
    computed: {
        cardNoDisplayed: function () {
            if (this.cif.cardNumber !== undefined && this.cif.cardNumber !== "") {
                return this.cif.cardNumber.substring(this.cif.cardNumber.length - 4, this.cif.cardNumber.length);
            } else {
                return "";
            }
        }
    },
    methods: {
        getUrlVars: function () {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function (m, key, value) {
                    vars[key] = value;
                });
            return vars;
        },
        getBalance: function () {
            if (this.balance.errorCode !== undefined) {
                console.log(this.balance.message);
                return "0.00";
            } else {
                var vars = {};
                this.balance.forEach(bal => {
                    vars[bal.type] = bal.amount;
                });
                return vars;
            }
        },
        getUnbilled: function () {
            if (this.unbilled.errorCode === undefined) {
                var temp_unbilled = this.unbilled;
                var results = [];
                var subDesc = "";
                temp_unbilled.forEach((u) => {
                    if (u.postDate === "") {
                        subDesc = " " + u.description;
                    } else {
                        results.push({
                            date: u.postDate,
                            details: {
                                desc: u.description + subDesc,
                                amount: u.amount
                            }
                        });
                        subDesc = "";
                    }
                });

                return results;
            }

            return [];
        },
        getStatement: function () {
            if (this.statement_transactions.errorCode === undefined) {
                var temp_statement = this.statement_transactions;
                var results = [];
                var subDesc = "";
                temp_statement.forEach((s) => {
                    if (s.transactionDate === "") {
                        subDesc = " " + s.description;
                    } else {
                        results.push({
                            date: s.transactionDate,
                            details: {
                                desc: s.description + subDesc,
                                amount: s.settlementAmount
                            }
                        });
                        subDesc = "";
                    }
                });

                return results;
            }

            return [];
        },
        getTransactions: function () {
            var temp_trans = this.getStatement();

            this.getUnbilled().forEach((un) => {
                temp_trans.push(un);
            });

            temp_trans.sort((a, b) => {
                var dateA = new Date(a.date),
                    dateB = new Date(b.date);
                return dateB - dateA;
            });
            var trans = [];
            if (temp_trans.length > 10) {
                trans = temp_trans.slice(0, 10);
            } else {
                trans = temp_trans;
            }

            return this.wrapTransactions(trans);
        },
        wrapTransactions: function (trans) {
            var wrapByDate = [];
            var mainDt = null;
            var details = [];
            trans.forEach((arr) => {
                if (mainDt === null) {
                    mainDt = new Date(arr.date);
                    details.push(arr.details);
                } else if (mainDt.getTime() === new Date(arr.date).getTime()) {
                    details.push(arr.details);
                } else {
                    wrapByDate.push({
                        date: mainDt,
                        details: details
                    });

                    details = [];

                    mainDt = new Date(arr.date);
                    details.push(arr.details);
                }
            });

            if (trans.length !== 0) {
                wrapByDate.push({
                    date: mainDt,
                    details: details
                });
            }

            return wrapByDate;
        },
        convertCurrency: function (amount) {
            if (amount !== undefined && amount !== "") {
                var negativeSign = amount.toString().includes('-') ? "-" : "";
                var n = Math.abs(parseFloat(amount)).toFixed(2).replace(/./g, function (c, i, a) {
                    return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
                });
                var num = negativeSign + n.toString();

                if (num === NaN || num === "NaN") {
                    return '--';
                }
                return num;
            } else {
                return "--";
            }
        },
        convertDate: function (json_date) {
            var date = new Date(json_date);
            var dateStr = this.months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
            return dateStr;
        },
        // goBack: function () {
        //     this.$http.post('/cards/unbilled', this.user).then((response) => {
        //         console.log("###### response:" + JSON.stringify(response.body));

        //         var results = response.body;
        //         if (results.accessToken !== undefined && results.accessToken !== "") {
        //             console.log("Ok");
        //             // success  
        //             var param = {
        //                 url: '/rating',
        //                 params: {
        //                     sender: this.getUrlVars().sender,
        //                     accessToken: results.accessToken
        //                 }
        //             }
        //             this.$http.post('/public/redirect', param).then((response) => {
        //                 window.location.href = response.body;
        //             });
        //         } else {
        //             this.invalid_msg = "*" + response.body.message;
        //         }
        //     });
        // }
        navigateToRatings: function () {
            window.location.href =
                "/rating?sender=" + this.sender + "&token=" + this.accessToken;
        }
    }
});

window.extAsyncInit = function () {

    MessengerExtensions.getUserID(function success(uids) {
        console.log("########## extension loaded" + JSON.stringify(uids));
    }, function error(err, errorMessage) {
        // Error handling code
        console.log("########## extension loaded" + errorMessage);

    });

};