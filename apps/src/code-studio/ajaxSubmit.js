import $ from 'jquery';

export default function ajaxSubmit(form_selector) {
  $(document).ready(function () {
    $(form_selector).on('ajax:beforeSend', function (e, xhr) {
      $('.publishLevelErrorMessage').hide();
      $('.validation-error').empty().hide();
      var token = $('meta[name="csrf-token"]').attr('content');
      xhr.setRequestHeader('X-CSRF-TOKEN', token);
    });
    $(form_selector).on('ajax:complete', function (e, data) {
      if (parseInt(data.status, 10) === 200) {
        localStorage.removeItem(
          'markdown_' + window.location.pathname.split('/').reverse()[1]
        );
        window.location.href = JSON.parse(data.responseText).redirect;
      }
    });
    $(form_selector).on('ajax:error', function (evt, xhr, status, error) {
      var errors;
      try {
        errors = $.parseJSON(xhr.responseText);
      } catch (err) {
        errors = {message: 'Error (' + error + '): ' + xhr.responseText};
      }
      $('.publishLevelErrorMessage').show();
      $('.validation-error')
        .show()
        .html("<p>Couldn't create level:</p>")
        .append(
          $('<ul/>').append(
            Object.keys(errors).map(function (v) {
              return $('<li/>').text(v + ': ' + errors[v]);
            })
          )
        );
    });
  });
}
