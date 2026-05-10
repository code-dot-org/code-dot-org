import React from 'react';

import SlidesViewer from '@cdo/apps/levelbuilder/lesson-slides-generator/SlidesViewer';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const data = getScriptData('slides');

  createReactRoot(
    <SlidesViewer panels={data.panels} />,
    document.getElementById('slides-container'),
    {
      legacyReactDomRender: true,
    }
  );
});
