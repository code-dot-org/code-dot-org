import React from 'react';
import ReactDOM from 'react-dom';

import FoormPreviewIndex from '@cdo/apps/code-studio/pd/foorm/FoormPreviewIndex';
import getScriptData from '@cdo/apps/util/getScriptData';

document.addEventListener('DOMContentLoaded', function (event) {
  ReactDOM.render(
    <FoormPreviewIndex {...getScriptData('props')} />,
    document.getElementById('application-container')
  );
});
