import $ from 'jquery';
import React from 'react';

import EditSpritelabMode from '@cdo/apps/lab2/levelEditors/spritelabMode/EditSpritelabMode';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialMode = getScriptData('spritelabmode');
  const lab2Checkbox = document.getElementById('level_uses_lab2');

  const subscribeToUsesLab2 = onChange => {
    const handleChange = () => onChange(lab2Checkbox.checked);
    lab2Checkbox?.addEventListener('change', handleChange);
    return () => lab2Checkbox?.removeEventListener('change', handleChange);
  };

  createReactRoot(
    <EditSpritelabMode
      initialMode={initialMode}
      initialUsesLab2={!!lab2Checkbox?.checked}
      subscribeToUsesLab2={subscribeToUsesLab2}
    />,
    document.getElementById('spritelab-mode-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
