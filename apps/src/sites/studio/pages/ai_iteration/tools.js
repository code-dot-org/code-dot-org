import React from 'react';

import DatasetMaker from '@cdo/apps/levelbuilder/ai-iteration-tools/DatasetMaker';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const aiIterationToolsData = getScriptData('aiIterationToolsData');
  createReactRoot(
    <DatasetMaker studentWorkAccess={aiIterationToolsData.studentWorkAccess} />,
    document.getElementById('ai-iteration-tools')
  );
});
