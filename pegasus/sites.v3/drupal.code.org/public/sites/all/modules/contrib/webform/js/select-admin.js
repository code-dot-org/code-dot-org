
/**
 * @file
 * Enhancements for select list configuration options.
 */

(function ($) {

Drupal.behaviors.webformSelectLoadOptions = {};
Drupal.behaviors.webformSelectLoadOptions.attach = function(context) {
  settings = Drupal.settings;

  $('#edit-extra-options-source', context).change(function() {
    var url = settings.webform.selectOptionsUrl + '/' + this.value;
    $.ajax({
      url: url,
      success: Drupal.webform.selectOptionsLoad,
      dataType: 'json'
    });
  });
}

Drupal.webform = Drupal.webform || {};

Drupal.webform.selectOptionsOriginal = false;
Drupal.webform.selectOptionsLoad = function(result) {
  if (Drupal.optionsElement) {
    if (result.options) {
      // Save the current select options the first time a new list is chosen.
      if (Drupal.webform.selectOptionsOriginal === false) {
        Drupal.webform.selectOptionsOriginal = $(Drupal.optionElements[result.elementId].manualOptionsElement).val();
      }
      $(Drupal.optionElements[result.elementId].manualOptionsElement).val(result.options);
      Drupal.optionElements[result.elementId].disable();
      Drupal.optionElements[result.elementId].updateWidgetElements();
    }
    else {
      Drupal.optionElements[result.elementId].enable();
      if (Drupal.webform.selectOptionsOriginal) {
        $(Drupal.optionElements[result.elementId].manualOptionsElement).val(Drupal.webform.selectOptionsOriginal);
        Drupal.optionElements[result.elementId].updateWidgetElements();
        Drupal.webform.selectOptionsOriginal = false;
      }
    }
  }
  else {
    if (result.options) {
      $('#' + result.elementId).val(result.options).attr('readonly', 'readonly');
    }
    else {
      $('#' + result.elementId).attr('readonly', '');
    }
  }
}

})(jQuery);
