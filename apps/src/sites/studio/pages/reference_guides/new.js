import React from 'react';

import NewReferenceGuideForm from '@cdo/apps/levelbuilder/reference-guide-editor/NewReferenceGuideForm';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const baseUrl = getScriptData('baseUrl');
  createReactRoot(
    <NewReferenceGuideForm baseUrl={baseUrl} />,
    document.getElementById('form')
  );
});
