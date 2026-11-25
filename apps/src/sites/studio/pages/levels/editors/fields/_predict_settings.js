import $ from 'jquery';
import React from 'react';

import EditPredictSettings from '@cdo/apps/lab2/levelEditors/predictSettings/EditPredictSettings';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialSettings = getScriptData('predictsettings');

  createReactRoot(
    <EditPredictSettings initialSettings={initialSettings} />,
    document.getElementById('predict-settings-editor')
  );
});
