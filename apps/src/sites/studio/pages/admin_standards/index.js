$(document).ready(function() {
  $('#import-standards').click(function(e) {
    var script = $('#select option:selected').val();
    var url =
      'http://www.codecurricula.com/metadata/' + script + '/standards.json';
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
          $('#alert-message').text(data.message);
        });
      })
      .fail(function() {
        alert(
          'Uh oh! There was a problem importing standards from curriculum builder.'
        );
      });
  });
});
