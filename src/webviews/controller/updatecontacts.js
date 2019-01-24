var Vue = new Vue({
  el: "#app",
  data: {
    isloading: false,
    show_step: 1,
    card_type: "",
    error_msg: [],
    error_msg_otp: "",
    error_msg_contacts: "",
    credit_card: "",
    deposit_card: "",
    questions: [],
    answers: [],
    answer: {},
    otp_number: {
      otp: "",
      referenceId: ""
    },
    contacts: {
      mobile: "",
      email: ""
    },
    old: {
      mobile: "",
      email: ""
    },
    mask_sign: "X",
    widget: {},
    invalid_card: "",
    token: "",
    expiry_mm: "",
    expiry_yy: "",
    last_action: "",
    request_id: "",
    otp_code: "",
    invalid_mobile: "",
    invalid_email: ""
  },
  ready: function() {
    var self = this;
    this.isloading = true;
    var log_details = {
      logtime: new Date(),
      user: this.getUrlVars().sender,
      module: "UPDATE_CONTACT",
      action: "UPDATE_CONTACT_WEBVIEW",
      skill: {
        name: "UPDATE_CONTACT",
        mode: "a"
      },
      params: [
        {
          user: this.getUrlVars().sender,
          module: "UPDATE_CONTACT",
          action: "UPDATE_CONTACT_WEBVIEW"
        }
      ]
    };

    this.$http
      .post("/logs", log_details)
      .then(response => {
        this.last_action = "UPDATE_CONTACT_WEBVIEW";
        this.initReCaptcha();
        $("#deposit_card").keyup(function() {
          var result = self.masked($(this).val(), self.deposit_card);
          $(this).val(result.masked_value);
          self.deposit_card = result.value;
        });
        $("#credit_card").keyup(function() {
          var result = self.masked($(this).val(), self.credit_card);
          $(this).val(result.masked_value);
          self.credit_card = result.value;
        });
      })
      .then(function() {
        this.isloading = false;
        $(".deposit, .creditCard").hide();
        $("input[type='radio']").click(function() {
          var radioValue = $("input[name='card_type']:checked").val();
          $("." + radioValue)
            .slideDown()
            .siblings()
            .slideUp();
        });

        $(".datepicker").pickadate({
          format: "yyyy-mm-dd",
          selectMonths: true, // Creates a dropdown to control month
          selectYears: 100, // Creates a dropdown of 15 years to control year,
          today: "Today",
          clear: "Clear",
          close: "Ok",
          closeOnSelect: false // Close upon selecting a date,
        });
      });
  },
  computed: {
    card: function() {
      if (this.card_type == "creditCard") {
        return this.credit_card;
      } else if (this.card_type == "deposit") {
        return this.deposit_card;
      } else {
        return "";
      }
    }
  },
  methods: {
    initReCaptcha: function() {
      var self = this;
      this.$http
        .get("/api/recaptcha/sitekey")
        .then(resp => {
          console.log("sitekey: " + JSON.stringify(resp.body));
          setTimeout(function() {
            if (typeof grecaptcha === "undefined") {
              self.initReCaptcha();
            } else {
              self.widget = grecaptcha.render("recaptcha", {
                sitekey: resp.body.sitekey
              });
            }
          }, 100);
        })
        .then(function() {
          $(".deposit, .creditCard").hide();
          $("input[type='radio']").click(function() {
            var radioValue = $("input[name='card_type']:checked").val();
            $("." + radioValue)
              .slideDown()
              .siblings()
              .slideUp();
          });

          $(".datepicker").pickadate({
            format: "yyyy-mm-dd",
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 100, // Creates a dropdown of 15 years to control year,
            today: "Today",
            clear: "Clear",
            close: "Ok",
            closeOnSelect: false // Close upon selecting a date,
          });
        });
    },
    masked: function(masked_value, value) {
      for (var i = 0; i < masked_value.length; i++) {
        if (masked_value.charAt(i) != this.mask_sign) {
          value += masked_value.charAt(i);
          masked_value = this.setCharAt(masked_value, i, this.mask_sign);
        }
      }
      if (value.length > masked_value.length) {
        value = value.slice(0, masked_value.length);
      }
      console.log(value + ":" + masked_value);
      return {
        value: value,
        masked_value: masked_value
      };
    },
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
    setCharAt: function(str, index, chr) {
      if (index > str.length - 1) return str;
      return str.substr(0, index) + chr + str.substr(index + 1);
    },
    validateMM: function() {
      if (this.expiry_mm > 12) {
        this.expiry_mm = 12;
      } else if (this.expiry_mm < 1) {
        this.expiry_mm = "";
      }
    },
    validateYY: function() {
      if (this.expiry_yy > 9999) {
        this.expiry_yy = "";
      } else if (this.expiry_yy < 0) {
        this.expiry_yy = "";
      }
    },
    getIndex(field) {
      this.answers.findIndex(ans => {
        return field == ans.field;
      });
    },
    getSecurityQuestions: function() {
      this.isloading = true;
      this.expiry_mm = "";
      this.expiry_yy = "";
      this.invalid_card = "";
      console.log("text " + this.card);
      if (this.card !== "") {
        var captcha_token = grecaptcha.getResponse(this.widget);
        this.$http
          .get("/api/recaptcha/verify", {
            headers: {
              token: captcha_token,
              sender_id: this.getUrlVars().sender,
              last_action: this.last_action
            }
          })
          .then(resp => {
            if (resp.body.success) {
              this.$http
                .post(
                  "/api/cup/validate-account/" +
                    this.getUrlVars().sender +
                    "/" +
                    this.last_action,
                  { number: this.card, type: this.card_type }
                )
                .then(response => {
                  this.last_action = "CUP_VALIDATE_ACCOUNT";
                  console.log(
                    "##### questions: " + JSON.stringify(response.body)
                  );
                  if (response.body.success) {
                    this.token = response.body.token;
                    var temp_ref = [];
                    var temp_questions = response.body.questions;
                    var i = 0;
                    temp_questions.forEach(q => {
                      q.index = i;
                      temp_ref[i] = {
                        field: q.field,
                        value: ""
                      };
                      i++;
                    });
                    this.answers = temp_ref;
                    this.questions = temp_questions;
                    this.show_step = 2;
                  } else {
                    this.invalid_card = response.body.errors[0].message;
                  }
                })
                .then(function() {
                  this.isloading = false;
                  $("input[type='radio']").click(function() {
                    var radioValue = $("input[name='card_type']:checked").val();
                    $("." + radioValue)
                      .slideDown()
                      .siblings()
                      .slideUp();
                  });

                  $(".datepicker").pickadate({
                    format: "yyyy-mm-dd",
                    selectMonths: true, // Creates a dropdown to control month
                    selectYears: 100, // Creates a dropdown of 15 years to control year,
                    today: "Today",
                    clear: "Clear",
                    close: "Ok",
                    closeOnSelect: false // Close upon selecting a date,
                  });
                  Materialize.updateTextFields();
                });
            } else {
              this.invalid_card = "Invalid Recaptcha.";
            }
          })
          .then(function() {
            this.isloading = false;
            $("input[type='radio']").click(function() {
              var radioValue = $("input[name='card_type']:checked").val();
              $("." + radioValue)
                .slideDown()
                .siblings()
                .slideUp();
            });

            $(".datepicker").pickadate({
              format: "yyyy-mm-dd",
              selectMonths: true, // Creates a dropdown to control month
              selectYears: 100, // Creates a dropdown of 15 years to control year,
              today: "Today",
              clear: "Clear",
              close: "Ok",
              closeOnSelect: false // Close upon selecting a date,
            });
            Materialize.updateTextFields();
          });
      } else {
        this.invalid_card = "Please choose and enter a valid account.";
        this.isloading = false;
      }
    },
    validateInformation: function() {
      this.isloading = true;

      if (this.expiry_mm != "") {
        this.answers.forEach(ans => {
          if (ans.field == "cardExpiry") {
            var exp_mm =
              this.expiry_mm.length == 1
                ? "0" + this.expiry_mm
                : this.expiry_mm;
            ans.value = this.expiry_yy + "-" + exp_mm;
          }
        });
      }

      console.log("##### validate answer: " + JSON.stringify(this.answers));

      this.$http
        .post(
          "/api/cup/validate-answer/" +
            this.getUrlVars().sender +
            "/" +
            this.last_action,
          this.answers,
          {
            headers: { token: this.token }
          }
        )
        .then(response => {
          this.last_action = "CUP_VALIDATE_ANSWER";
          console.log("response2: " + JSON.stringify(response.body));
          if (response.body.success) {
            this.old.mobile = response.body.mobileNo;
            this.old.email = response.body.email;
            this.show_step = 3;
          } else {
            this.error_msg = response.body.errors;
          }
          this.isloading = false;
        })
        .then(function() {
          $("input[type='radio']").click(function() {
            var radioValue = $("input[name='card_type']:checked").val();
            $("." + radioValue)
              .slideDown()
              .siblings()
              .slideUp();
          });

          $(".datepicker").pickadate({
            format: "yyyy-mm-dd",
            selectMonths: true, // Creates a dropdown to control month
            selectYears: 100, // Creates a dropdown of 15 years to control year,
            today: "Today",
            clear: "Clear",
            close: "Ok",
            closeOnSelect: false // Close upon selecting a date,
          });
          Materialize.updateTextFields();
        });
    },
    sendOTP: function() {
      this.isloading = true;
      this.$http.get("/api/otp?number=" + this.old.mobile).then(result => {
        console.log("##### Response OTP: " + JSON.stringify(result.body));
        this.request_id = result.body.request_id;
        this.show_step = 4;
        this.isloading = false;
      });
    },
    verifyOTP: function() {
      this.err_msg_otp = "";
      this.isloading = true;
      if (this.code != "") {
        var args = {
          request_id: this.request_id,
          code: this.code
        };
        this.$http.post("/api/otp").then(result => {
          if (result.body.status == 0) {
            this.show_step = 5;
          } else {
            this.err_msg_otp = result.body.error_text;
          }
          this.isloading = false;
        });
      } else {
        this.err_msg_otp = "Invalid code";
        this.isloading = false;
      }
    },
    updateContacts: function() {
      this.err_msg_otp = "";
      this.isloading = true;
      this.error_msg_contacts = "";
      this.invalid_mobile = "";
      this.invalid_email = "";
      if (this.otp_code != "") {
        var args = {
          request_id: this.request_id,
          code: this.otp_code
        };
        this.$http.post("/api/otp", args).then(result => {
          if (result.body.status == 0) {
            this.$http
              .post(
                "/api/cup/update-account/" +
                  this.getUrlVars().sender +
                  "/" +
                  this.last_action,
                this.contacts,
                {
                  headers: { token: this.token }
                }
              )
              .then(response => {
                this.last_action = "CUP_UPDATE_ACCOUNT";
                if (response.body.success) {
                  this.show_step = 5;
                } else {
                  response.body.errors.forEach(err => {
                    if (err.field === "mobileNo") {
                      this.invalid_mobile = err.message;
                    } else if (err.field === "email") {
                      this.invalid_email = err.message;
                    }
                  });
                  this.show_step = 3;
                }
                this.isloading = false;
              });
          } else {
            this.err_msg_otp = result.body.error_text;
            this.isloading = false;
          }
        });
      } else {
        this.err_msg_otp = "Invalid code";
        this.isloading = false;
      }
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
