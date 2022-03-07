import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ReferenceGuideIndex from '@cdo/apps/templates/referenceGuides/ReferenceGuideIndex';

$(() => {
  const referenceGuides = getScriptData('referenceGuides');
  ReactDOM.render(
    <ReferenceGuideIndex referenceGuides={referenceGuides} />,
    document.getElementById('show-container')
  );
});
