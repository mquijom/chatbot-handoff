(function(d, s, id) {
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
    isloading: false,
    show_step: 1,
    payee_name: "",
    mytable: "",
    request_id: "",
    error_msg: "",
    invalid_msg: "",
    success_message: "",
    releasing_branch: [],
    last_action: ""
  },
  ready: function() {
    this.isloading = true;
    var log_details = {
      logtime: new Date(),
      user: this.getUrlVars().sender,
      module: "CHECK_WRITER",
      action: "CHECKWRITER_WEBVIEW",
      skill: {
        name: "CHECK_WRITER",
        mode: "a"
      },
      params: [
        {
          user: this.getUrlVars().sender,
          module: "CHECK_WRITER",
          action: "CHECKWRITER_WEBVIEW"
        }
      ]
    };

    this.$http
      .post("/logs", log_details)
      .then(response => {
        this.last_action = "CHECKWRITER_WEBVIEW";
        this.isloading = false;
      })
      .then(function() {
        $(".collapsible").collapsible();
      });
  },
  methods: {
    getUrlVars: function() {
      var vars = {};
      var parts = window.location.href.replace(
        /[?&]+([^=&]+)=([^&]*)/gi,
        function(m, key, value) {
          vars[key] = value;
        }
      );
      return vars;
    },
    cancel: function() {
      MessengerExtensions.requestCloseBrowser(
        function success() {
          callback();
        },
        function error(err) {
          console.log("closing......");
          //web close
          window.open("", "_parent", "");
          window.close();
          //ios
          open(location, "_self").close();
          callback();
        }
      );
    },
    checkAvailableBranches: function() {
      this.invalid_msg = "";
      this.success_message = "";
      this.releasing_branch = [];
      this.isloading = true;
      this.$http
        .get(
          "/api/checkwriter/" +
            this.getUrlVars().sender +
            "/" +
            this.last_action +
            "?payee_name=" +
            this.payee_name
        )
        .then(response => {
          this.last_action = "CHECKWRITER_SEARCH";
          if (
            response.body.releasingBranch &&
            response.body.releasingBranch.length !== 0 &&
            response.body.releasingBranch.length !== "0"
          ) {
            this.releasing_branch = response.body.releasingBranch;
            this.success_message = response.body.message;
          } else {
            // this.invalid_msg = "Sorry. Your check still not available at any branches.";
            this.invalid_msg = response.body.message;
          }
          this.isloading = false;
        })
        .then(function() {
          $(".collapsible").collapsible();
        });
    },
    displayDateFormat(date) {
      console.log("################ " + date);
      var dt = new Date(date).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "2-digit"
      });
      return dt;
    }
  }
});

window.extAsyncInit = function() {
  MessengerExtensions.getUserID(
    function success(uids) {
      console.log("########## extension loaded" + JSON.stringify(uids));
    },
    function error(err, errorMessage) {
      // Error handling code
      console.log("########## extension loaded" + errorMessage);
    }
  );
};
