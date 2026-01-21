import { createRoot } from "react-dom/client";
import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import ExemplarSettings from '@cdo/apps/lab2/levelEditors/exemplar/ExemplarSettings';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const appName = document.querySelector('script[data-levelname]').dataset
    .appname;
  const exemplarDefined = !!getScriptData('exemplarsources');
  const exemplarSettings = getScriptData('exemplarsettings');

  const root = createRoot(document.getElementById('exemplar-settings-editor'));

  root.render(<div>
    <ExemplarSettings
      appName={appName}
      exemplarDefined={exemplarDefined}
      initialExemplarSettings={exemplarSettings}
    />
  </div>);
});
