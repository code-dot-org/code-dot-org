/* global $ skipSound preTitle lastServerResponse Dialog */

var dialogType = null;
var adjustedScroll = false;

$(function () {
  if (preTitle != "") {
    window.setTimeout(function () {
      showDialog("pre");
    }, 1000);
  }
});

function dialogHidden() {
  if (dialogType == "success" && lastServerResponse.nextRedirect) {
    window.location.href = lastServerResponse.nextRedirect;
  }

  if (dialogType == "error") {
    adjustScroll();
  }
}

function showDialog(type) {
  dialogType = type;

  var dialog = new Dialog({ body: "", onHidden: dialogHidden });

  // Use our prefabricated dialog content.
  $(".modal-body").append($("#" + type + "-dialogcontent").clone(true));

  // Clicking the okay button in the dialog box dismisses it.
  $(".modal-body #ok-button").click(function () {
    dialog.hide();
  });

  dialog.show();
}

function adjustScroll() {
  if (adjustedScroll) {
    return;
  }

  var win = $(window);
  var el = $('.mainblock');
  var winPos = win.scrollTop() + win.height();
  var elPos = el.offset().top + el.height() - 10;

  if (winPos < elPos) {
    $('html, body').animate({
      scrollTop: $(".submitButton:first").offset().top - 10
    }, 1000);
  }

  adjustedScroll = true;
}
