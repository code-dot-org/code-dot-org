import React from 'react';

import ReferenceGuideEditAll from '@cdo/apps/levelbuilder/reference-guide-editor/ReferenceGuideEditAll';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const referenceGuides = getScriptData('referenceGuides');
  const baseUrl = getScriptData('baseUrl');
  createReactRoot(
    <ReferenceGuideEditAll
      referenceGuides={referenceGuides}
      baseUrl={baseUrl}
    />,
    document.getElementById('show-container')
  );
});
