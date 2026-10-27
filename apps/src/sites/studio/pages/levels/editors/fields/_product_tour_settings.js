import $ from 'jquery';
import React from 'react';

import EditProductTourSettings from '@cdo/apps/lab2/levelEditors/productTourSettings/EditProductTourSettings';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialSettings = getScriptData('producttoursettings');
  const appName = getScriptData('appname') ?? '';

  createReactRoot(
    <EditProductTourSettings
      initialSettings={initialSettings}
      appName={appName}
    />,
    document.getElementById('product-tour-settings-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
