$(document).ready(function() {
  $('#import-standards').click(function(e) {
    var courseCode = $('#select option:selected').val();
    var url =
      'http://curriculumbuilder.herokuapp.com/metadata/' +
      courseCode +
      '/standards.json';
    $.ajax({
      url: url,
      type: 'get'
    })
      .done(function(data) {
        $('#data-spew').text(JSON.stringify(data));
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
