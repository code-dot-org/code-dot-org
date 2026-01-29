import React from 'react';
import ReactDOM from 'react-dom';

import DatasetMaker from '@cdo/apps/levelbuilder/ai-iteration-tools/DatasetMaker';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const aiIterationToolsData = getScriptData('aiIterationToolsData');
  ReactDOM.render(
    <DatasetMaker studentWorkAccess={aiIterationToolsData.studentWorkAccess} />,
    document.getElementById('ai-iteration-tools')
  );
});
