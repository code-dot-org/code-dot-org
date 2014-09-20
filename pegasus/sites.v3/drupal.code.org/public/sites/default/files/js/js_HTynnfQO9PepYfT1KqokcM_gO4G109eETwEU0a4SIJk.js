function adjustHeight(obj, offset) {
	var helpFrame = jQuery("#" + obj.name);
	var innerDoc = (helpFrame.get(0).contentDocument) ? helpFrame.get(0).contentDocument : helpFrame.get(0).contentWindow.document;
	helpFrame.height(innerDoc.body.scrollHeight + offset);
}
;

/**
 * JavaScript behaviors for the front-end display of webforms.
 */

(function ($) {

Drupal.behaviors.webform = Drupal.behaviors.webform || {};

Drupal.behaviors.webform.attach = function(context) {
  // Calendar datepicker behavior.
  Drupal.webform.datepicker(context);
};

Drupal.webform = Drupal.webform || {};

Drupal.webform.datepicker = function(context) {
  $('div.webform-datepicker').each(function() {
    var $webformDatepicker = $(this);
    var $calendar = $webformDatepicker.find('input.webform-calendar');
    var startDate = $calendar[0].className.replace(/.*webform-calendar-start-(\d{4}-\d{2}-\d{2}).*/, '$1').split('-');
    var endDate = $calendar[0].className.replace(/.*webform-calendar-end-(\d{4}-\d{2}-\d{2}).*/, '$1').split('-');
    var firstDay = $calendar[0].className.replace(/.*webform-calendar-day-(\d).*/, '$1');
    // Convert date strings into actual Date objects.
    startDate = new Date(startDate[0], startDate[1] - 1, startDate[2]);
    endDate = new Date(endDate[0], endDate[1] - 1, endDate[2]);

    // Ensure that start comes before end for datepicker.
    if (startDate > endDate) {
      var laterDate = startDate;
      startDate = endDate;
      endDate = laterDate;
    }

    var startYear = startDate.getFullYear();
    var endYear = endDate.getFullYear();

    // Set up the jQuery datepicker element.
    $calendar.datepicker({
      dateFormat: 'yy-mm-dd',
      yearRange: startYear + ':' + endYear,
      firstDay: parseInt(firstDay),
      minDate: startDate,
      maxDate: endDate,
      onSelect: function(dateText, inst) {
        var date = dateText.split('-');
        $webformDatepicker.find('select.year, input.year').val(+date[0]);
        $webformDatepicker.find('select.month').val(+date[1]);
        $webformDatepicker.find('select.day').val(+date[2]);
      },
      beforeShow: function(input, inst) {
        // Get the select list values.
        var year = $webformDatepicker.find('select.year, input.year').val();
        var month = $webformDatepicker.find('select.month').val();
        var day = $webformDatepicker.find('select.day').val();

        // If empty, default to the current year/month/day in the popup.
        var today = new Date();
        year = year ? year : today.getFullYear();
        month = month ? month : today.getMonth() + 1;
        day = day ? day : today.getDate();

        // Make sure that the default year fits in the available options.
        year = (year < startYear || year > endYear) ? startYear : year;

        // jQuery UI Datepicker will read the input field and base its date off
        // of that, even though in our case the input field is a button.
        $(input).val(year + '-' + month + '-' + day);
      }
    });

    // Prevent the calendar button from submitting the form.
    $calendar.click(function(event) {
      $(this).focus();
      event.preventDefault();
    });
  });
}

})(jQuery);
;
// jQuery Input Hints plugin
// Copyright (c) Rob Volk
// https://github.com/robvolk/jQuery.InputHints
// http://robvolk.com/jquery-form-input-hints-plugin
(function (n) { n.fn.inputHints = function () { function r(t) { jQuery(t).val() == "" && jQuery(t).val(n(t).attr("placeholder")).addClass("hint") } function i(t) { n(t).val() == n(t).attr("placeholder") && n(t).val("").removeClass("hint") } var t = n(this); return t.each(function () { r(this) }), t.closest("form").submit(function () { return t.each(function () { i(this) }), !0 }), t.focus(function () { i(this) }).blur(function () { r(this) }) } })(jQuery)
;
(function ($) {

$(function() {
    // hook up placeholder text on any input with a placeholder attribute
    $('input[placeholder]').inputHints();
});

// $(function() {
//   // For all petition forms.
//   $('[id|="webform-client-form-27"]').submit(function() {
//     // Check for required fields.
//     if (validate_form(this)) {
//       return true;
//     }
//     else {
//       console.log('All fields are required.');
//       return false;
//     }
//   });
// });
// 
// function validate_form(form) {
//   form.$('input[type=text]').each(function() {
//     if (this.val == '') {
//       return false;
//     }
//   });
//   return true;
// }

})(jQuery);
;
