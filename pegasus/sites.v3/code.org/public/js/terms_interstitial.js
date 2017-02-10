function interstitialLoaded() {

  $("#user_terms_of_service_version").on('change', function (event) {
    if ($(this).is(':checked')) {
      $("#accept-terms-submit").prop('disabled', false).removeClass("disabled-button");
    } else {
      $("#accept-terms-submit").prop('disabled', true).addClass("disabled-button");
    }
  });

  $("#edit_user").submit(function (event) {
    event.preventDefault();
    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: $(this).serialize(),
      dataType: 'json',
      complete: function (data) {$("#terms-modal").modal('hide'); /* location.reload(); */ }
    });
  });

  // The modal will only be in the DOM if the dashboard rendering code detects that it's
  // needed for the current user.
  if ($("#terms-modal").length > 0) {

    $('#later-link').click(function () {
      $("#terms-modal").modal('hide');
    });

    var printLink = $('#print-terms');
    if (printLink) {
      printLink.click(function () {
        var item = $("#print-frame")[0];
        item.contentWindow.print();
      });
    }

    var already_shown = !!getTermsCookie('hide_tos');
    if (!already_shown) {
      $("#terms-modal").modal('show');
      setTermsCookie('hide_tos', '1');
    }
  }
}

function setTermsCookie(key, value) {
  var expires = new Date();
  // Kill hide_tos cookie at midnight every night
  // so the terms interstitial pops up once a day.
  expires.setHours(23,59,59,0);
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getTermsCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}
