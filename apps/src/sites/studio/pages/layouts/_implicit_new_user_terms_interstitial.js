import $ from 'jquery';

$(document).ready(function() {
  $('#edit_user').submit(function(event) {
    event.preventDefault();
    $.ajax({
      type: 'POST',
      url: $(this).attr('action'),
      data: $(this).serialize(),
      dataType: 'json',
      complete: function(data) {
        $('#implicit-terms-modal').modal('hide');
        location.reload();
      }
    });
  });

  $('#later-link').click(function() {
    $('#implicit-terms-modal').modal('hide');
  });
});
