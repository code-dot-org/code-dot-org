import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ReferenceGuideEditAll from '@cdo/apps/templates/referenceGuides/ReferenceGuideEditAll';

$(() => {
  const referenceGuides = getScriptData('referenceGuides');
  ReactDOM.render(
    <ReferenceGuideEditAll referenceGuides={referenceGuides} />,
    document.getElementById('show-container')
  );
});
