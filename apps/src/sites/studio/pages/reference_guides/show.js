import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ReferenceGuideView from '@cdo/apps/templates/referenceGuides/ReferenceGuideView';

$(() => {
  const referenceGuide = getScriptData('referenceGuide');
  const referenceGuides = getScriptData('referenceGuides');
  ReactDOM.render(
    <ReferenceGuideView
      referenceGuide={referenceGuide}
      referenceGuides={referenceGuides}
    />,
    document.getElementById('show-container')
  );
});
