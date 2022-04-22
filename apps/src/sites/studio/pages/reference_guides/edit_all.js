import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import ReferenceGuideEditAll from '@cdo/apps/lib/levelbuilder/reference-guide-editor/ReferenceGuideEditAll';

$(() => {
  const referenceGuides = getScriptData('referenceGuides');
  const baseUrl = getScriptData('baseUrl');
  ReactDOM.render(
    <ReferenceGuideEditAll
      referenceGuides={referenceGuides}
      baseUrl={baseUrl}
    />,
    document.getElementById('show-container')
  );
});
