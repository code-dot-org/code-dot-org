$(document).ready(function() {
  $('#import-standards').click(function(e) {
    var script = $('#select option:selected').val();
    var url =
      'https://curriculum.code.org/metadata/' + script + '/standards.json';
    $.ajax({
      url: url,
      type: 'get'
    })
      .done(function(data) {
        $.ajax({
          url: '/admin/standards',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify(data)
        }).done(function(data) {
          $('#alert-message').append('<div id=alert-details/>');
          $('#alert-details').text(data.message);
        });
      })
      .fail(function() {
        alert(
          'Uh oh! There was a problem importing standards from curriculum builder.'
        );
      });
  });
});
