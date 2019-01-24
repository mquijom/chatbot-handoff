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

var Vue = new Vue({
    el: "#app",
    data: {
        isloading: false,
        show_step: 1,
        first_letter: "",
        mothers_last_name: "",
        gsis_card: "",
        requestId: "",
        refNo: "",
        otp_code: "",
        error_msg: "",
        invalid_msg: "",
        invalid_otp: false,
        mobile_no: "",
        invalid_gsis_card: "",
        invalid_mothers_name: "",
        invalid_mothers_fst_letter: "",
        last_action: ""
    },
    ready: function () {
        this.isloading = true;
        var log_details = {
            logtime: new Date(),
            user: this.getUrlVars().sender,
            module: 'GSIS_ACTIVATION',
            action: 'GSIS_ACTIVATION_WEBVIEW',
            skill: { name: "GSIS_ACTIVATION", mode: 'a' },
            params: [{
                user: this.getUrlVars().sender,
                module: 'GSIS_ACTIVATION',
                action: 'GSIS_ACTIVATION_WEBVIEW'
            }]
        }
        this.$http.post('/logs', log_details).then((response) => {
            this.last_action = 'GSIS_ACTIVATION_WEBVIEW';
            this.isloading = false;
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
        check_details: function () {
            this.isloading = true;
            var gsis_card_details = {
                "gsisNo": this.gsis_card,
                "mothersMaidenName": this.mothers_last_name + this.first_letter
            }
            this.$http.post('/api/gsis/activation/' + this.getUrlVars().sender + '/' + this.last_action, gsis_card_details).then((response) => {
                this.last_action = 'GSIS_ACTIVATION_VALIDATION';
                if (response.body.errorCode) {
                    this.$set('invalid_msg', response.body.message);

                } else {
                    //set mobile number ending
                    this.refNo = response.body.refNo;
                    this.requestId = response.body.requestId;
                    this.show_step = 2;
                }
                this.isloading = false;
            });
        },
        next: function () {
            var validated = true;
            this.invalid_gsis_card = "";
            this.invalid_mothers_name = "";
            this.invalid_mothers_fst_letter = "";
            //check fields
            if (this.gsis_card === "") {
                this.invalid_gsis_card = "GSIS Number is mandory";
                validated = false;
            } else if (this.gsis_card.length < 10) {
                this.invalid_gsis_card = "GSIS Number must be 12 digits";
                validated = false;
            }

            if (this.first_letter === "") {
                this.invalid_mothers_fst_letter = "1st letter of Mother's First Name is mandatory";
                validated = false;
            }

            if (this.mothers_last_name === "") {
                this.invalid_mothers_name = "Mother's Last Name is mandatory";
                validated = false;
            }

            if (validated) {
                this.check_details();
            } else {

            }
        },
        verify: function () {
            this.isloading = true;
            this.$set('error_msg', '');
            if (!this.otp_code) {
                this.$set('error_msg', 'Please enter your One-Time Password');
                this.isloading = false;
            } else {
                var otp_details = {
                    "gsisNo": this.gsis_card,
                    "requestId": this.requestId,
                    "pin": this.otp_code,
                    "refNo": this.refNo
                };
                this.$http.post('/api/gsis/activation/otp/' + this.getUrlVars().sender + '/' + this.last_action, otp_details).then((response) => {
                    this.last_action = 'GSIS_ACTIVATION_OTP';
                    if (response.body.errorCode) {
                        this.$set('error_msg', response.body.message);
                        this.isloading = false;
                    } else {
                        this.isloading = false;
                        console.log(JSON.stringify(response.body));
                        this.show_step = 3;
                    }
                });
            }
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