import {getRawDatasets} from '@code-dot-org/ailab';
import $ from 'jquery';
import React from 'react';

import EditAilabMode from '@cdo/apps/lab2/levelEditors/ailabMode/EditAilabMode';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const initialMode = getScriptData('ailabmode');

  createReactRoot(
    <EditAilabMode initialMode={initialMode} datasets={getRawDatasets()} />,
    document.getElementById('ailab-mode-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
