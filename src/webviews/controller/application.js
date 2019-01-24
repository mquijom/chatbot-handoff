var Vue = new Vue({
    el: "#app",
    data: {
        showScreenNo: 1,
        firstScreen: 1,
        lastScreen: 4,
        showCity: false,
        showCitiesEmp: false,
        cardProduct: [],
        error_msg: [],
        provinces: [],
        cities: [],
        citiesEmp: [],
        citizenships: [],
        salutations: [],
        civil_status: [],
        government_ids: [],
        occupations: [],
        ranks: [],
        educations: [],
        empPositions: [],
        captcha_code: "",
        months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        isloading: false,
        isSuccess: false,
        application: {
            applicationId: "",
            appSource: "2",
            solCode: "CEB601",
            appianNumber: "",
            customer: {
                name: {
                    first: "",
                    last: "",
                    middle: ""
                },
                title: "",
                sex: "",
                birthDate: "",
                birthPlace: "",
                nationality: "",
                civilStatus: "",
                presentAddress: {
                    line1: "",
                    line2: "",
                    city: "",
                    province: "",
                    zipCode: "",
                    lengthOfStay: ""
                },
                homePhoneNumber: "",
                mobileNumber: "",
                email: "",
                education: "",
                motherMaidenName: "",
                dependentsNumber: ""
            },
            employment: {
                name: "",
                position: "",
                type: "",
                address: {
                    line1: "",
                    line2: "",
                    city: "",
                    province: "",
                    zipCode: ""
                },
                phoneNumber: "",
                lengthOfService: ""
            },
            card: {
                product: "",
                type: "",
                feeCode: "1",
                digitalSoa: "1",
                billingAddress: "H",
                deliveryAddress: "H",
                embossName: ""
            }
        },
        invalid_cardProduct: "",
        invalid_second_page: "",
        invalid_third_page: "",
        last_action: ""
    },
    ready: function () {
        this.isloading = true;
        var self = this;
        var log_details = {
            logtime: new Date(),
            user: this.getUrlVars().sender,
            module: 'FIND_A_CREDIT_CARD',
            action: 'FIND_A_CREDIT_CARD_WEBVIEW',
            skill: {
                name: "FIND_A_CREDIT_CARD",
                mode: 'a'
            },
            params: [{
                user: this.getUrlVars().sender,
                module: 'FIND_A_CREDIT_CARD',
                action: 'FIND_A_CREDIT_CARD_WEBVIEW'
            }]
        }

        this.$http.post('/logs', log_details).then((response) => {
            this.last_action = 'FIND_A_CREDIT_CARD_WEBVIEW';
            $('input[type=radio][name=group1]').change(function () {
                self.application.card.deliveryAddress = self.application.card.billingAddress;
                console.log("### BILL AND DELIVERY ADDRESS: " + self.application.card.deliveryAddress + " = " + self.application.card.billingAddress);
            });

            $('#cardProduct').change(function () {
                self.application.card.product = $(this).val();
            });

            $('#salutation').change(function () {
                self.application.customer.title = $(this).val();
                self.setGender();
            });

            $('#civilStatus').change(function () {
                self.application.customer.civilStatus = $(this).val();
            });

            $('#nationality').change(function () {
                self.application.customer.nationality = $(this).val();
            });

            $('#city').change(function () {
                self.application.customer.presentAddress.city = $(this).val();
            });

            $('#position').change(function () {
                self.application.employment.position = $(this).val();
            });

            $('#rankType').change(function () {
                self.application.employment.type = $(this).val();
            });

            $('#cityEmp').change(function () {
                self.application.employment.address.city = $(this).val();
            });

            $('#province').change(function () {
                self.application.customer.presentAddress.province = $(this).val();
                self.setCity();
            });

            $('#provinceEmp').change(function () {
                self.application.employment.address.province = $(this).val();
                self.setCitiesEmp();
            });

            if (this.getUrlVars().cardtype !== '') {
                this.application.card.type = this.getUrlVars().cardtype;
                this.$http.get('/api/application-libraries/' + this.getUrlVars().sender + '/' + this.last_action + '?category=card&type=cardslist&cardtype=' + this.getUrlVars().cardtype).then((response) => {
                    this.last_action = 'FIND_A_CREDIT_CARD_LIBRARIES';
                    console.log("### CARD PRODUCT: " + JSON.stringify(response.body.records));
                    this.cardProduct = response.body.records;

                    this.$http.get('/api/application-libraries/' + this.getUrlVars().sender + '/' + this.last_action + '?category=card&type=province').then((response2) => {
                        this.last_action = 'FIND_A_CREDIT_CARD_LIBRARIES';
                        this.provinces = response2.body.records;
                        // console.log("### PROVINCES: " + JSON.stringify(this.provinces));
                        this.$http.get('/api/application-libraries/' + this.getUrlVars().sender + '/' + this.last_action + '?category=card&type=education').then((response3) => {
                            this.last_action = 'FIND_A_CREDIT_CARD_LIBRARIES';
                            this.educations = response3.body.records;
                            // console.log("### EDUCATIONS: " + JSON.stringify(this.educations));
                            this.$http.get('/api/application-libraries/' + this.getUrlVars().sender + '/' + this.last_action + '?category=card&type=occupation').then((response4) => {
                                this.last_action = 'FIND_A_CREDIT_CARD_LIBRARIES';
                                this.occupations = response4.body.records;
                                // console.log("### OCCUPATIONS: " + JSON.stringify(this.occupations));

                                this.$http.get('/localData').then((response5) => {
                                    var localData = response5.body;

                                    this.salutations = localData.salutations;
                                    this.civil_status = localData.civil_status;
                                    this.citizenships = localData.nationality;
                                    this.ranks = localData.ranks;
                                    this.application.card.product = this.getUrlVars().cardcode ? this.getUrlVars().cardcode : '';
                                    console.log('##### DONE LOADING #####');
                                    this.isloading = false;
                                })
                                    .then(function () {
                                        $('select').formSelect();
                                    });
                            });
                        });
                    });
                })
                    .then(function () {
                        $('select').formSelect();
                    });
            }
        });
    },
    methods: {
        submit: function () {
            this.application.applicationId = new Date().valueOf();

            console.log("### APPLICATION: " + JSON.stringify(this.application));
            this.isloading = true;
            this.$http.post('/api/submit-application/' + this.getUrlVars().sender + '/' + this.last_action, this.application).then((response) => {
                this.last_action = 'FIND_A_CREDIT_CARD_SUBMIT';
                console.log("### APPLICATION: " + JSON.stringify(response.body));
                this.application.appianNumber = response.body.appianNumber;
            }).then(function () {
                this.isSuccess = true;
                this.isloading = false;
            });
        },
        setCity: function () {
            // this.isloading = true;
            this.$http.get('/api/application-libraries/' + this.getUrlVars().sender + '/' + this.last_action + '?category=card&type=city&province=' + this.application.customer.presentAddress.province).then((response) => {
                this.last_action = 'FIND_A_CREDIT_CARD_LIBRARIES';
                this.cities = response.body.records;
                console.log("### CITIES: " + JSON.stringify(this.cities));
            }).then(function () {
                $('select').formSelect();
                this.showCity = true;
                // this.isloading = false;
            });
        },
        setCitiesEmp: function () {
            // this.isloading = true;
            this.$http.get('/api/application-libraries/' + this.getUrlVars().sender + '/' + this.last_action + '?category=card&type=city&province=' + this.application.employment.address.province).then((response) => {
                this.last_action = 'FIND_A_CREDIT_CARD_LIBRARIES';
                this.citiesEmp = response.body.records;
                console.log("### CITIES EMP: " + JSON.stringify(this.citiesEmp));
            }).then(function () {
                $('select').formSelect();
                this.showCitiesEmp = true;
                // this.isloading = false;
            });
        },
        setGender: function () {
            switch (this.application.customer.title) {
                case 'MR':
                    this.application.customer.sex = 0;
                    break;
                case 'MS': case 'MRS':
                    this.application.customer.sex = 1;
                    break;
            }
        },
        changeName: function () {
            var middleExist = this.application.customer.name.middle !== '' ? " " + this.application.customer.name.middle + " " : " ";
            this.application.card.embossName = this.application.customer.name.first + middleExist + this.application.customer.name.last;
        },
        next: function () {
            this.isloading = true;

            this.invalid_cardProduct = "";
            this.invalid_second_page = "";
            this.invalid_third_page = "";
            console.log('test: ' + this.showScreenNo + ':::' + this.application.card.product);
            //check fields
            if (this.showScreenNo === 1 && this.application.card.product === "") {
                this.invalid_cardProduct = "Please fill out this field.";
            }

            if (this.showScreenNo === 2 && (this.application.customer.title === "" || this.application.customer.name.first === "" ||
                this.application.customer.name.middle === "" || this.application.customer.name.last === "" || this.application.card.embossName === "" ||
                this.application.customer.motherMaidenName === "" || this.application.customer.civilStatus === "" || this.application.customer.birthDate === "" ||
                this.application.customer.birthPlace === "" || this.application.customer.nationality === "" || this.application.customer.dependentsNumber === "" ||
                this.application.customer.presentAddress.line1 === "" || this.application.customer.presentAddress.province === "" || this.application.customer.presentAddress.city === "" ||
                this.application.customer.presentAddress.zipCode === "" || this.application.customer.homePhoneNumber === "" || this.application.customer.mobileNumber === "" ||
                this.application.customer.email === "")) {
                this.invalid_second_page = "Please fill out all required field.";
            }

            if (this.showScreenNo === 3 && (this.application.employment.name === "" || this.application.employment.position === "" ||
                this.application.employment.type === "" || this.application.employment.address.line1 === "" ||
                this.application.employment.address.province === "" || this.application.employment.address.city === "" ||
                this.application.customer.presentAddress.zipCode === "" || this.application.employment.phoneNumber === "" ||
                this.application.employment.lengthOfService === "")) {
                this.invalid_third_page = "Please fill out all required field.";
            }
            console.log(this.invalid_cardProduct + ':::' + this.invalid_second_page + ':::' + this.invalid_third_page)
            if (this.invalid_cardProduct === "" && this.invalid_second_page === "" &&
                this.invalid_third_page === "") {
                this.showScreenNo = parseInt(this.showScreenNo) + 1;
            }

            this.isloading = false;
        },
        back: function () {
            this.showScreenNo = parseInt(this.showScreenNo) - 1;
        },
        getUrlVars: function () {
            var vars = {};
            var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
                function (m, key, value) {
                    vars[key] = value;
                });
            return vars;
        },
        convertCurrency: function (amount) {
            var negativeSign = amount.toString().includes('-') ? "-" : "";
            var n = Math.abs(parseInt(amount)).toFixed(2).replace(/./g, function (c, i, a) {
                return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
            });
            var num = negativeSign + n.toString();
            return num;
        },
        convertDate: function (json_date) {
            var date = new Date(json_date);
            var dateStr = this.months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
            return dateStr;
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
        okBtn: function () {
            this.$http.post('/callback', { method: "APPLICATION_SAVE", sender: this.getUrlVars().sender }).then((response) => {
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
            });
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