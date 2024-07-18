import React from 'react';
import {createRoot} from 'react-dom/client';

import NewReferenceGuideForm from '@cdo/apps/lib/levelbuilder/reference-guide-editor/NewReferenceGuideForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const baseUrl = getScriptData('baseUrl');
  const root = createRoot(document.getElementById('form'));
  root.render(<NewReferenceGuideForm baseUrl={baseUrl} />);
});
