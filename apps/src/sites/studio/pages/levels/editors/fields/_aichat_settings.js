import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import EditAichatSettings from '@cdo/apps/lab2/levelEditors/aichatSettings/EditAichatSettings';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialSettings = getScriptData('aichatsettings');

  const root = createRoot(document.getElementById('aichat-settings-editor'));
  root.render(<EditAichatSettings initialSettings={initialSettings} />);
});
