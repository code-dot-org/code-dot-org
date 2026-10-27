import $ from 'jquery';
import React from 'react';

import EditAichatSettings from '@cdo/apps/lab2/levelEditors/aichatSettings/EditAichatSettings';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialSettings = getScriptData('aichatsettings');

  createReactRoot(
    <EditAichatSettings initialSettings={initialSettings} />,
    document.getElementById('aichat-settings-editor')
  );
});
