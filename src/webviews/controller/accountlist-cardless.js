var Vue = new Vue({
    el: "#app",
    data: {
        casa_accounts: [{
            account: {
                desc: "Peso Regular Savings",
                number: "**** **** 0200"
            },
            currency: "PHP",
            balance: "130456.00"
        }, {
            account: {
                desc: "Regular Checking",
                number: "**** **** 1310"
            },
            currency: "PHP",
            balance: "46641.01"
        }]
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
        viewTransaction: function () {
            window.location.href = '/transactions?sender=' + this.getUrlVars().sender + '&account_no=2018011011223344';
        },
        myAccount: function () {
            window.location.href = '/request_form?sender=' + this.getUrlVars().sender + '&username=' + this.getUrlVars().username;
        },
        proceed: function (casa) {
            console.log('SELECTED CASA:::' + JSON.stringify(casa));
            window.location.href = '/request_form?sender=' + this.getUrlVars().sender + '&account_number=' + casa.account.number + '&balance=' + casa.balance;
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