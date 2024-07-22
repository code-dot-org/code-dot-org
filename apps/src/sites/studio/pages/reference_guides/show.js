import React from 'react';
import ReactDOM from 'react-dom';

import ReferenceGuideView from '@cdo/apps/templates/referenceGuides/ReferenceGuideView';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const referenceGuide = getScriptData('referenceGuide');
  const referenceGuides = getScriptData('referenceGuides');
  const baseUrl = getScriptData('baseUrl');
  ReactDOM.render(
    <ReferenceGuideView
      referenceGuide={referenceGuide}
      referenceGuides={referenceGuides}
      baseUrl={baseUrl}
    />,
    document.getElementById('show-container')
  );
});
