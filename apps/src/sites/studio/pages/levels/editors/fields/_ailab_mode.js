import {getRawDatasets} from '@code-dot-org/ailab';
import $ from 'jquery';
import React from 'react';

import EditAilabMode from '@cdo/apps/lab2/levelEditors/ailabMode/EditAilabMode';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialMode = getScriptData('ailabmode');
  const lab2Checkbox = document.getElementById('level_uses_lab2');

  const subscribeToUsesLab2 = onChange => {
    const handleChange = () => onChange(lab2Checkbox.checked);
    lab2Checkbox?.addEventListener('change', handleChange);
    return () => lab2Checkbox?.removeEventListener('change', handleChange);
  };

  createReactRoot(
    <EditAilabMode
      initialMode={initialMode}
      datasets={getRawDatasets()}
      initialUsesLab2={!!lab2Checkbox?.checked}
      subscribeToUsesLab2={subscribeToUsesLab2}
    />,
    document.getElementById('ailab-mode-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
