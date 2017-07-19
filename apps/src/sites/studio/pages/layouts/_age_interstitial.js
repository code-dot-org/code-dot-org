import getScriptData from '@cdo/apps/util/getScriptData';

function shouldSubmitBeEnabled() {
  if ($("#usertype").find("select")[0].value === 'student') {
    return $("#age").find("select")[0].value !== '';
  } else {
    return $("#email-address").find("input")[0].value !== '';
  }
}

function refreshSubmitState() {
  $("#edit_user").find(".btn").prop('disabled', !shouldSubmitBeEnabled());
}

$().ready(function () {
  $("#age-modal").modal('show');
  $("#email-address").hide();

  $("#edit_user").find("select").on('change', function (event) {
    refreshSubmitState();
  });

  $("#email-address").find("input").on('input', function (event) {
    refreshSubmitState();
  });

  const sectionsAsStudent = getScriptData('ageInterstitial').hasSections;

  if (sectionsAsStudent) {
    $("#usertype").hide();
  } else {
    $("#usertype").find("select").on('change', function (event) {
      if (this.value === 'teacher') {
        $("#email-address").show();
        $("#age").hide();
        $("#age").find("select").val("");

      } else {
        $("#email-address").hide();
        $("#age").show();
        $("#email-address").find("input").val("");
      }
      refreshSubmitState();
    });
  }

  $("#edit_user").submit(function (event) {
    event.preventDefault();
    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: $(this).serialize(),
      dataType: 'json',
      success: function (data) {$("#age-modal").modal('hide');}
    });
  });
});
