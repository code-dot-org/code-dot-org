import $ from 'jquery';
import React from 'react';

import EditAiTutorPromptSettings from '@cdo/apps/lab2/levelEditors/aiTutorPromptSettings/EditAiTutorPromptSettings';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialSettings = getScriptData('aitutorpromptsettings');

  createReactRoot(
    <EditAiTutorPromptSettings initialSettings={initialSettings} />,
    document.getElementById('ai-tutor-prompt-settings-editor')
  );
});
