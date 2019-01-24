var Vue = new Vue({
    el: "#app",
    data: {
        doneLoading: false,
        header: {},
        items: [],
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    },
    ready: function () {
        this.$http.get('/statement_header?card_no=5302200318286200').then((response) => {
            // this.$set('header', response.body);      
            this.header = response.body;
            this.$http.get('/statement_transactions?card_no=5302200318286200').then((response2) => {
                // this.$set('items', response2.body);
                this.items = response2.body;
                this.items.reverse();
                this.doneLoading = true;
            });
        });

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
        getItems: function () {
            var temp = this.items;
            var byDates = [];
            var fxRate = "";
            for (var i = 0; i < temp.length; i++) {
                if (temp[i].dtTransactionDate === "") {
                    fxRate = " " + temp[i].strDescription;
                } else if (temp[i].strDescription !== "" &&
                    temp[i].dblSettlementAmount !== "" &&
                    (byDates === [] || !this.dtContains(byDates, temp[i].dtTransactionDate))) {

                    if (i === temp.length - 1) {
                        byDates.push({
                            date: temp[i].dtTransactionDate + fxRate,
                            details: [{
                                desc: temp[i].strDescription,
                                amount: temp[i].dblSettlementAmount
                            }]
                        });
                        break;
                    }

                    var dat = new Date(temp[i].dtTransactionDate);
                    var details = [];
                    details.push({
                        desc: temp[i].strDescription + fxRate,
                        amount: temp[i].dblSettlementAmount
                    });

                    var d1 = new Date(temp[i].dtTransactionDate);
                    var fxRate2 = "";
                    for (var j = i + 1; j < temp.length; j++) {
                        if (temp[j].dtTransactionDate === "") {
                            fxRate2 = temp[j].strDescription;
                        } else {
                            var d2 = new Date(temp[j].dtTransactionDate);
                            if (d1.getDate() === d2.getDate() &&
                                d1.getMonth() === d2.getMonth() &&
                                d1.getFullYear() === d2.getFullYear()) {
                                details.push({
                                    desc: temp[j].strDescription + fxRate2,
                                    amount: temp[j].dblSettlementAmount
                                });
                            }
                            fxRate2 = "";
                        }
                    }

                    byDates.push({
                        date: dat,
                        details: details
                    });

                    fxRate = "";
                }
            }

            return byDates;
        },
        dtContains: function (a, dtPostDate) {
            var i = a.length;
            while (i--) {
                var d = new Date(a[i].date);
                var dt = new Date(dtPostDate);
                if (d.getDate() === dt.getDate() &&
                    d.getMonth() === dt.getMonth() &&
                    d.getFullYear() === dt.getFullYear()) {
                    return true;
                }
            }
            return false;
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
        balanceInquiry: function () {
            window.location.href = "/balance-inq?sender=" + this.getUrlVars().sender;
        },
        viewTransaction: function () {
            window.location.href = "/unbilled-trans?sender=" + this.getUrlVars().sender;
        },
        goBack: function () {
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
        }
    }
})