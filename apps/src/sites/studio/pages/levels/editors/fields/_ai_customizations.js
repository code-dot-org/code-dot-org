import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import EditAiCustomizations from '@cdo/apps/lab2/levelEditors/aiCustomizations/EditAiCustomizations';

$(document).ready(function () {
  const initialCustomizations = getScriptData('aicustomizations');
  const levelName = document.querySelector('script[data-levelname]').dataset
    .levelname;
  const appName = document.querySelector('script[data-appname]').dataset
    .appname;

  ReactDOM.render(
    <EditAiCustomizations
      initialCustomizations={initialCustomizations}
      levelName={levelName}
      appName={appName}
    />,
    document.getElementById('ai-customizations-container')
  );
});
