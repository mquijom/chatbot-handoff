var Vue = new Vue({
    el: "#app",
    data: {
    },
    ready: function () {

        window.parent.postMessage(this.getUrlVars().code, '*');

        // localStorage.setItem("access_code", this.getUrlVars().code);
        // window.location.href = localStorage.getItem("redirectUrl") + '?sender=' + localStorage.getItem("sender") + '&code=' + this.getUrlVars().code;
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
})
window.extAsyncInit = function () {

    MessengerExtensions.getUserID(function success(uids) {
        console.log("########## extension loaded" + JSON.stringify(uids));
    }, function error(err, errorMessage) {
        // Error handling code
        console.log("########## extension loaded" + errorMessage);

    });

};