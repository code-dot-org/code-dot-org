import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import EditPredictSettings from '@cdo/apps/lab2/levelEditors/predictSettings/EditPredictSettings';

$(document).ready(function () {
  const initialSettings = getScriptData('predictsettings');

  ReactDOM.render(
    <EditPredictSettings initialSettings={initialSettings} />,
    document.getElementById('predict-settings-container')
  );
});
