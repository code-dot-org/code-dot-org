import React from 'react';

import AIIterationTools from '@cdo/apps/levelbuilder/ai-iteration-tools/AIIterationTools';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const aiIterationToolsData = getScriptData('aiIterationToolsData');
  createReactRoot(
    <AIIterationTools
      aiTutorAccess={aiIterationToolsData.aiTutorAccess}
      studentWorkAccess={aiIterationToolsData.studentWorkAccess}
    />,
    document.getElementById('ai-iteration-tools')
  );
});
