$(document).ready(function() {
  $(':input').removeAttr('required');

  $('#hoc-survey-form select').selectize({
    plugins: ['fast_click']
  });

  // Only allow whole integers
  $('#students-number-total').keypress(function(event) {
    return /\d/.test(String.fromCharCode(event.keyCode));
  }).triggerHandler('keypress');
  $('#students-number-total').change(function() {
    $(this).val($(this).val().match(/\d+/));
  }).triggerHandler('change');

  // Only allow whole integers
  $('#students-number-girls').keypress(function(event) {
    return /\d/.test(String.fromCharCode(event.keyCode));
  }).triggerHandler('keypress');
  $('#students-number-girls').change(function() {
    $(this).val($(this).val().match(/\d+/));
  }).triggerHandler('change');

  // Only allow whole integers
  $('#students-number-ethnicity').keypress(function(event) {
    return /\d/.test(String.fromCharCode(event.keyCode));
  }).triggerHandler('keypress');
  $('#students-number-ethnicity').change(function() {
    $(this).val($(this).val().match(/\d+/));
  }).triggerHandler('change');

  $('#event-country').change(function() {
    if ($(this).val() == 'United States') {
      $('#students-number-ethnicity-wrapper').show();
    } else {
      $('#students-number-ethnicity').val('');
      $('#students-number-ethnicity-wrapper').hide();
    }
  }).triggerHandler('change');

  $('#teacher-how-heard').change(function() {
    if ($.inArray('Other', $(this).val()) > -1) {
      $('#teacher-how-heard-other-wrapper').show();
    } else {
      $('#teacher-how-heard-other').val('');
      $('#teacher-how-heard-other-wrapper').hide();
    }
  }).triggerHandler('change');

  // Limit to 250 words
  $('#event-improvement').keyup(function() {
    var newVal = $(this).val().match(/^(?:\s*\S*){0,250}/);
    $(this).val(newVal);
  }).triggerHandler('keyup');
  $('#event-improvement').change(function() {
    var newVal = $(this).val().match(/^(?:\s*\S*){0,250}/);
    $(this).val(newVal);
  }).triggerHandler('change');

  $( "#hoc-survey-form" ).submit(function( event ) {
    surveyFormSubmit();
  });
});

function surveyFormComplete(data)
{
  window.location.href = window.location.href.replace("/survey/","/survey/prize/");
}

function surveyFormError(data)
{
  $('.has-error').removeClass('has-error');

  var errors = Object.keys(data.responseJSON);
  var errors_count = errors.length;

  for (var i = 0; i < errors_count; ++i) {
    var error_id = '#' + errors[i].replace(/_/g, '-');
    error_id = error_id.replace(/-[sbi]s?$/, '');
    $(error_id).parents('.form-group').addClass('has-error');
  }

  $('#error-message').text('An error occurred. Please check to make sure all required fields have been filled out.').show();
  $("#signup_submit").removeAttr('disabled');

  $('body').scrollTop(0);
  $("#btn-submit").removeAttr('disabled');
  $("#btn-submit").removeClass("button_disabled").addClass("button_enabled");
}

function surveyFormSubmit()
{
  $("#signup_submit").attr('disabled','disabled');

  $.ajax({
    url: "/forms/HocSurvey2015",
    type: "post",
    dataType: "json",
    data: $("#hoc-survey-form").serialize()
  }).done(surveyFormComplete).fail(surveyFormError);

  return false;
}
