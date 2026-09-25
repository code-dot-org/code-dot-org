import {getRawDatasets} from '@code-dot-org/ailab';
import $ from 'jquery';
import React from 'react';

import {getModeSaveError} from '@cdo/apps/lab2/levelEditors/ailabMode/ailabMode';
import EditAilabMode from '@cdo/apps/lab2/levelEditors/ailabMode/EditAilabMode';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialMode = getScriptData('ailabmode');
  const datasets = getRawDatasets();
  const lab2Checkbox = document.getElementById('level_uses_lab2');
  const editorElement = document.getElementById('ailab-mode-editor');

  const subscribeToUsesLab2 = onChange => {
    const handleChange = () => onChange(lab2Checkbox.checked);
    lab2Checkbox?.addEventListener('change', handleChange);
    return () => lab2Checkbox?.removeEventListener('change', handleChange);
  };

  // jquery_ujs cancels a remote form submit when an ajax:before handler returns false.
  $(editorElement)
    .closest('form')
    .on('ajax:before', function () {
      if (!lab2Checkbox?.checked) {
        return true;
      }
      const error = getModeSaveError(
        $('#level_mode').val() ?? '',
        datasets.map(dataset => dataset.id)
      );
      if (!error) {
        return true;
      }
      $('.publishLevelErrorMessage').show();
      $('.validation-error')
        .show()
        .html("<p>Couldn't save level:</p>")
        .append($('<ul/>').append($('<li/>').text('mode: ' + error)));
      return false;
    });

  createReactRoot(
    <EditAilabMode
      initialMode={initialMode}
      datasets={datasets}
      initialUsesLab2={!!lab2Checkbox?.checked}
      subscribeToUsesLab2={subscribeToUsesLab2}
    />,
    editorElement,
    {
      legacyReactDomRender: true,
    }
  );
});
