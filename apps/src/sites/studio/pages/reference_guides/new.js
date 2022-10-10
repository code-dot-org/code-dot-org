import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import NewReferenceGuideForm from '@cdo/apps/lib/levelbuilder/reference-guide-editor/NewReferenceGuideForm';

$(document).ready(() => {
  const baseUrl = getScriptData('baseUrl');
  ReactDOM.render(
    <NewReferenceGuideForm baseUrl={baseUrl} />,
    document.getElementById('form')
  );
});
