var Vue = new Vue({
    el: "#app",
    data: {
        reference_no: "",
        success_msg: "",
        invalid_msg: "",
        isloading: false,
        last_action: ""
    },
    ready: function () {
        this.isloading = true;
        var log_details = {
            logtime: new Date(),
            user: this.getUrlVars().sender,
            module: 'CC_APPLICATION_STATUS',
            action: 'CC_APPLICATION_STATUS_WEBVIEW',
            skill: {
                name: "CC_APPLICATION_STATUS",
                mode: 'a'
            },
            params: [{
                user: this.getUrlVars().sender,
                module: 'CC_APPLICATION_STATUS',
                action: 'CC_APPLICATION_STATUS_WEBVIEW'
            }]
        }

        this.$http.post('/logs', log_details).then((response) => {
            this.last_action = 'CC_APPLICATION_STATUS_WEBVIEW';
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
        checkStatus: function () {
            this.isloading = true;
            this.success_msg = "";
            this.invalid_msg = "";
            this.$http.get('/api/application-status/' + this.getUrlVars().sender + '/' + this.last_action + '?appianNumber=' + this.reference_no)
                .then((resp) => {
                    this.last_action = 'CC_APPLICATION_STATUS_CHECK';
                    if (resp.body.errors) {
                        this.invalid_msg = resp.body.errors[0].message;
                    } else {
                        this.success_msg = resp.body.status;
                    }
                    this.isloading = false;
                });
        },
        cancel() {
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