import $ from 'jquery';

$(document).ready(() => {
  var editUser = $('#edit_user');
  var raceCheckboxes = $('.race-checkbox');

  editUser.on('change', () => {
    var shouldEnableSubmit = false;
    var optOutSelected = false;
    raceCheckboxes.each(function (i) {
      if (this.checked) {
        shouldEnableSubmit = true;
        if (this.id === 'user_races_opt_out') {
          optOutSelected = true;
        }
      }
    });
    if (optOutSelected) {
      // Disable and clear all non-opt-out checkboxes and gray out labels
      var others = raceCheckboxes.not('#user_races_opt_out');
      others.prop('checked', false);
      others.prop('disabled', true);
      others.parent().addClass('disabled'); // gray out labels
    } else {
      // Re-enable
      raceCheckboxes.prop('disabled', false);
      raceCheckboxes.parent().removeClass('disabled');
    }

    if (shouldEnableSubmit) {
      $('#race-submit').prop('disabled', false).removeClass('disabled-button');
    } else {
      $('#race-submit').prop('disabled', true).addClass('disabled-button');
    }
  });

  function submitCheckboxData(form) {
    $.ajax({
      type: 'POST',
      url: form.prop('action'),
      data: form.serialize(),
      dataType: 'json',
      success: data => $('#race-modal').modal('hide')
    });
  }

  editUser.submit((event) => {
    event.preventDefault();
    submitCheckboxData(editUser);
  });

  $('#later-link').click(() => {
    // Clear out all checkboxes, check 'closed_dialog'
    raceCheckboxes.prop('checked', false);
    $('#user_races_closed_dialog').prop('checked', true);
    submitCheckboxData(editUser);
    $('#race-modal').modal('hide');
  });
});

$(document).ready(() => {
  $('#race-modal').modal('show');
  $('#closed-dialog-label').hide();
});
