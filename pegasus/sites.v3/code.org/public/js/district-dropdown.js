var selectize;
var selected_state;

$(function () {
  selectize = $('#school-districts select').selectize({
    plugins: ['fast_click'],
    diacritics: false,
    multiple: false,
    allowEmptyOption: false,
    create: false
  });

  $('#school-type').change(function () {
    if (['public', 'other'].indexOf($(this).val()) > -1) {
      $('#school-state').closest('.form-group').show();
      $('#school-zipcode').closest('.form-group').hide();
    } else {
      $('#school-state').closest('.form-group').hide();
      $('#school-zipcode').closest('.form-group').show();
      $('#school-district').closest('.form-group').hide();
    }
  });

  $('#school-state').change(function () {
    if ($(this).val() != 'other') {
      $('#school-district').closest('.form-group').show();
    } else {
      $('#school-district').closest('.form-group').hide();
    }
  });
});
