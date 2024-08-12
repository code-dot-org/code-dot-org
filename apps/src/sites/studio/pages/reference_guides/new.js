import React from 'react';
import ReactDOM from 'react-dom';

import NewReferenceGuideForm from '@cdo/apps/lib/levelbuilder/reference-guide-editor/NewReferenceGuideForm';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const baseUrl = getScriptData('baseUrl');
  ReactDOM.render(
    <NewReferenceGuideForm baseUrl={baseUrl} />,
    document.getElementById('form')
  );
});
