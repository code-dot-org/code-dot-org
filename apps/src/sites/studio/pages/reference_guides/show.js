import React from 'react';

import ReferenceGuideView from '@cdo/apps/templates/referenceGuides/ReferenceGuideView';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const referenceGuide = getScriptData('referenceGuide');
  const referenceGuides = getScriptData('referenceGuides');
  const baseUrl = getScriptData('baseUrl');
  createReactRoot(
    <ReferenceGuideView
      referenceGuide={referenceGuide}
      referenceGuides={referenceGuides}
      baseUrl={baseUrl}
    />,
    document.getElementById('show-container')
  );
});
