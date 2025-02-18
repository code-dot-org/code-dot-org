import React from 'react';
import ReactDOM from 'react-dom';

import ReferenceGuideEditAll from '@cdo/apps/levelbuilder/reference-guide-editor/ReferenceGuideEditAll';
import getScriptData from '@cdo/apps/util/getScriptData';

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
