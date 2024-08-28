import $ from 'jquery';

import initializeCodeMirror from '@cdo/apps/code-studio/initializeCodeMirror';
import getScriptData from '@cdo/apps/util/getScriptData';

const sampleValidationCodeMap = getScriptData('map');
let validationEditor;

$(initPage);

function initPage() {
  const widgetMode = $('#level_widget_mode');
  const embed = $('#level_embed');
  const autoValidate = $('#level_validation_enabled');
  if (autoValidate.length > 0) {
    embed.on('click', () => syncValidateWithElements(embed, widgetMode));
    widgetMode.on('click', () => syncValidateWithElements(embed, widgetMode));
  }
  if ($('#level_validation_code').length > 0) {
    validationEditor = initializeCodeMirror(
      'level_validation_code',
      'javascript'
    );
  }
  for (const name in sampleValidationCodeMap) {
    const sampleValidationCode = sampleValidationCodeMap[name];
    const element = $('#generateValidation' + name);
    element.on(
      'click',
      () =>
        validationEditor &&
        validationEditor.getDoc().setValue(sampleValidationCode)
    );
  }
}

function syncValidateWithElements(element1, element2) {
  const autoValidate = $('#level_validation_enabled');
  const eitherChecked = element1.prop('checked') || element2.prop('checked');
  autoValidate.prop('checked', !eitherChecked);
  autoValidate.prop('disabled', eitherChecked);
}
