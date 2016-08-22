$(document).ready(function () {
  var printButton = $('#print-button');
  if (printButton) {
    printButton.click(function () {
      var item = $("#print-frame")[0];
      item.contentWindow.document.getElementsByTagName("img")[0].style.width="100%";
      if (item.contentWindow.document.execCommand('print', false, null)) {
      } else {
        item.contentWindow.print();
      }
    });
  }

  $('#later-link').click(function () {
    $("#terms-modal").modal('hide');
  });
});

$('#accept-terms-checkbox').change(function () {
  if ($(this).is(':checked')) {
    $("#submit-button").prop('disabled', false).removeClass("disabled-button");
  } else {
    $("#submit-button").prop('disabled', true).addClass("disabled-button");
  }
});
