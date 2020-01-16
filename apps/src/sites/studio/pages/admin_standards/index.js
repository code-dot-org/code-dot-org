$(document).ready(function() {
  $('#import-standards').click(function(e) {
    var script = $('#select option:selected').val();
    var url = 'http://localhost:8000/metadata/' + script + '/standards.json';
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
        });
      })
      .fail(function() {
        alert('Whoops! There was a problem with the import.');
      });
  });
});
