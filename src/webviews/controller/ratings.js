(function (d, s, id) {
    var js,
        fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.com/en_US/messenger.Extensions.js";
    fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "Messenger");

var Vue = new Vue({
    el: "#app",
    data: {

        show_step2: false,
        rate: 0,
        
    },
    
    ready: function () {
        this.isloading = true;
        var log_details = {
            logtime: new Date(),
            user: this.getUrlVars().sender,
            module: "RATING",
            action: "RATING_WEBVIEW",
            skill: {
                name: "CC_BALANCE_RATING",
                mode: "a",
            },
            params: [{
                user: this.getUrlVars().sender,
                module: "RATING",
                action: "RATING_WEBVIEW",
            }]
        };

        this.$http
            .post("/logs", log_details)
            .then(response => {
                this.last_action = "RATING_WEBVIEW";
                this.isloading = false;
            })
            .then(function () {
                $(".collapsible").collapsible();
            });
    },
    methods: {
        getUrlVars: function () {
            var vars = {};
            var parts = window.location.href.replace(
                /[?&]+([^=&]+)=([^&]*)/gi,
                function (m, key, value) {
                    vars[key] = value;
                }
            );
            return vars;
        },
       

        selectRate(cnt, type) {
            cnt = cnt + 1;
            if (type === 0) {
                this.rate = cnt;
            } else {
                this.rate = this.rate + cnt;
            }
        },
    

        submit: function () {

            
            //todo
            /**
             * 1. invoke api
             * 2. if success proceed next
             * 3. error close
             */
            this.$http.post('https://back-office-chatbot.herokuapp.com/rates',
                {
                    page_id:'',
                    rate:this.rate,
                    user: {
                        sender:this.getUrlVars().sender
                    },
                    skill: {
                        name:this.getUrlVars().skill
                    }
                })
            .then(response =>{
                console.log(JSON.stringify(response))                 
                this.show_step2 = true;
            })
            .catch(err =>{
                //close
            })
        },
        verify() {
            // this.show_step2 = true;
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
        }
    }
});

window.extAsyncInit = function () {
    MessengerExtensions.getUserID(
        function success(uids) {
            console.log("########## extension loaded" + JSON.stringify(uids));
            //     messages.push({
            //   text: "You can also locate a branch or ATM using the UnionBank Online App. Learn more at  http://bit.ly/ViewAccounts or download the App for free at the App Store http://apple.co/2v0TAnU or Google Play  http://bit.ly/2w9Jaal."
            // });
        },
        function error(err, errorMessage) {
            // Error handling code
            console.log("########## extension loaded" + errorMessage);
        }
    );
};