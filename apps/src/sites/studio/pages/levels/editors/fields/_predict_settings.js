import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditPredictSettings from '@cdo/apps/lab2/levelEditors/predictSettings/EditPredictSettings';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialSettings = getScriptData('predictsettings');

  const root = createRoot(document.getElementById('predict-settings-editor'));
  root.render(<EditPredictSettings initialSettings={initialSettings} />);
});
