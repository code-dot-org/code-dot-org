import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import EditAiCustomizations from '@cdo/apps/lab2/levelEditors/aiCustomizations/EditAiCustomizations';

$(document).ready(function () {
  const initialSettings = getScriptData('aichatsettings');

  ReactDOM.render(
    <EditAiCustomizations initialSettings={initialSettings} />,
    document.getElementById('aichat-settings-container')
  );
});
