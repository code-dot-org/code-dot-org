import $ from 'jquery';
import React from 'react';

import {INSTRUCTIONS_KEYS} from '@cdo/apps/ailab/engine';
import {getDefaultInstructions} from '@cdo/apps/ailab/lab2/defaultInstructions';
import EditAilabDynamicInstructions from '@cdo/apps/lab2/levelEditors/ailabDynamicInstructions/EditAilabDynamicInstructions';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialDynamicInstructions = getScriptData('ailabdynamicinstructions');
  const lab2Checkbox = document.getElementById('level_uses_lab2');

  const subscribeToUsesLab2 = onChange => {
    const handleChange = () => onChange(lab2Checkbox.checked);
    lab2Checkbox?.addEventListener('change', handleChange);
    return () => lab2Checkbox?.removeEventListener('change', handleChange);
  };

  const defaults = Object.fromEntries(
    INSTRUCTIONS_KEYS.map(key => [key, getDefaultInstructions(key)])
  );

  createReactRoot(
    <EditAilabDynamicInstructions
      initialDynamicInstructions={initialDynamicInstructions}
      defaults={defaults}
      initialUsesLab2={!!lab2Checkbox?.checked}
      subscribeToUsesLab2={subscribeToUsesLab2}
    />,
    document.getElementById('ailab-dynamic-instructions-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
