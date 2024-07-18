import React from 'react';
import {createRoot} from 'react-dom/client';

import ReferenceGuideEditAll from '@cdo/apps/lib/levelbuilder/reference-guide-editor/ReferenceGuideEditAll';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const referenceGuides = getScriptData('referenceGuides');
  const baseUrl = getScriptData('baseUrl');
  const root = createRoot(document.getElementById('show-container'));

  root.render(
    <ReferenceGuideEditAll
      referenceGuides={referenceGuides}
      baseUrl={baseUrl}
    />
  );
});
