

$(document).ready(function () {

	$('#new-pass').hide();
	$('#repeat-pass').hide();
	$("#password2").attr('disabled', 'disabled');
	// $('input[type="submit"]').attr('disabled','disabled');
	// $('input[type="submit"]').css("cursor", "not-allowed");
	$('button').attr('disabled','disabled');
	$('button').css("cursor", "not-allowed");

	$("#password1").keyup(function () {

		$('#new-pass').show();

		var ucase = new RegExp("[A-Z]+");
		var lcase = new RegExp("[a-z]+");
		var num = new RegExp("[0-9]+");

		if ($("#password1").val().length >= 8) {
			$("#8char").removeClass("icon-x");
			$("#8char").addClass("icon-check");
		} else {
			$("#8char").removeClass("icon-check");
			$("#8char").addClass("icon-x");
		}

		if (ucase.test($("#password1").val())) {
			$("#ucase").removeClass("icon-x");
			$("#ucase").addClass("icon-check");
		} else {
			$("#ucase").removeClass("icon-check");
			$("#ucase").addClass("icon-x");
		}

		if (lcase.test($("#password1").val())) {
			$("#lcase").removeClass("icon-x");
			$("#lcase").addClass("icon-check");
			$("#lcase").css("color", "#00A41E");
		} else {
			$("#lcase").removeClass("icon-check");
			$("#lcase").addClass("icon-x");
		}

		if (num.test($("#password1").val())) {
			$("#num").removeClass("icon-x");
			$("#num").addClass("icon-check");
			$("#num").css("color", "#00A41E");
		} else {
			$("#num").removeClass("icon-check");
			$("#num").addClass("icon-x");
		}

		if ($("#password1").val().length >= 8
			&& ucase.test($("#password1").val()) 
				&& lcase.test($("#password1").val()) 
					&& num.test($("#password1").val())) {
			$("#password2").removeAttr('disabled');
		} else {
			$("#password2").attr('disabled', 'disabled');
		}
	});

	$("#password2").keyup(function () {

		$('#repeat-pass').show();	

		if ($("#password1").val() == $("#password2").val()) {
			$("#pwmatch").removeClass("icon-x");
			$("#pwmatch").addClass("icon-check");
			$('button').removeAttr('disabled');
			$('button').css("cursor", "pointer");
		} else {
			$("#pwmatch").removeClass("icon-check");
			$("#pwmatch").addClass("icon-x");
			$('button').attr('disabled','disabled');
			$('button').css("cursor", "not-allowed");
		}
	});
});