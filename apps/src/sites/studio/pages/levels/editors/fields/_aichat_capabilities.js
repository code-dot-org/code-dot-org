import $ from 'jquery';
import React from 'react';

import EditAichatCapabilities from '@cdo/apps/lab2/levelEditors/aichatCapabilities/EditAichatCapabilities';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialCapabilities = getScriptData('aichatcapabilities');

  createReactRoot(
    <EditAichatCapabilities initialCapabilities={initialCapabilities} />,
    document.getElementById('aichat-capabilities-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
