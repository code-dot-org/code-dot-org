import $ from 'jquery';
import React from 'react';
import {createRoot} from 'react-dom/client';

import EditPredictSettings from '@cdo/apps/lab2/levelEditors/predictSettings/EditPredictSettings';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialSettings = getScriptData('predictsettings');

  const root = createRoot(
    document.getElementById('predict-settings-container')
  );
  root.render(<EditPredictSettings initialSettings={initialSettings} />);
});
