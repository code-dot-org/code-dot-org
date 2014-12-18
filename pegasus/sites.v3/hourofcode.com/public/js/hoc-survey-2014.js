$(document).ready(function() {
  $('#hoc-survey-form select').selectize({
    plugins: ['fast_click']
  });

  $('#teacher-how-heard').change(function() {
    if ($.inArray('Other', $(this).val()) > -1) {
      $('#teacher-how-heard-other-wrapper').show();
    } else {
      $('#teacher-how-heard-other').val('');
      $('#teacher-how-heard-other-wrapper').hide();
    }
    console.log(this);
  }).triggerHandler('change');
});
