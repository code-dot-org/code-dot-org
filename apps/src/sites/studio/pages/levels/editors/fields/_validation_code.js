import $ from 'jquery';

$(initPage);

function initPage() {
  const widgetMode = $('#level_widget_mode');
  const embed = $('#level_embed');
  const autoValidate = $('#level_validation_enabled');
  if (autoValidate.length > 0) {
    embed.on('click', () => syncValidateWithElements(embed, widgetMode));
    widgetMode.on('click', () => syncValidateWithElements(embed, widgetMode));
  }
}

function syncValidateWithElements(element1, element2) {
  const autoValidate = $('#level_validation_enabled');
  const eitherChecked = element1.prop('checked') || element2.prop('checked');
  autoValidate.prop('checked', !eitherChecked);
  autoValidate.prop('disabled', eitherChecked);
}
