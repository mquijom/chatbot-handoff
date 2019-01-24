var _self = {};

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,
        function (m, key, value) {
            vars[key] = value;
        });
    return vars;
}

function initLogs(mod, act, _this) {
    console.log('initialize logs: ' + JSON.stringify(getUrlVars()));
    this._self = _this;
    _this.request_data.log_details = {
        logtime: new Date(),
        user: getUrlVars()['sender'],
        module: mod,
        action: act,
        params: [{
            user: getUrlVars()['sender'],
            module: mod,
            action: act
        }]
    }
}

function updateLogs(act, params) {
    var mod = this._self.request_data.log_details.action;
    this._self.request_data.log_details.module = mod;
    this._self.request_data.log_details.params[0].module = mod;
    this._self.request_data.log_details.action = act;
    this._self.request_data.log_details.params[0].action = act;
    if (params !== null) {
        this._self.request_data.details = params;
    } else {
        this._self.request_data.details = {};
    }
}

function updateLogsv2(mod, act, params) {
    this._self.request_data.log_details.module = mod;
    this._self.request_data.log_details.params[0].module = mod;
    this._self.request_data.log_details.action = act;
    this._self.request_data.log_details.params[0].action = act;
    if (params !== null) {
        this._self.request_data.details = params;
    } else {
        this._self.request_data.details = {};
    }
}

function sendLogs(params) {
    console.log('test send logs: ' + JSON.stringify(this._self.request_data.log_details));
    var data = this._self.request_data;
    data.log_details.skill = {};
    data.log_details.skill = params;
    this._self.$http.post('/logs', data).then((response) => {
    });
}

function closeView() {
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