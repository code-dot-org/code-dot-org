import React from 'react';
import ReactDOM from 'react-dom';

import AIIterationTools from '@cdo/apps/levelbuilder/ai-iteration-tools/AIIterationTools';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const aiIterationToolsData = getScriptData('aiIterationToolsData');
  ReactDOM.render(
    <AIIterationTools
      aiTutorAccess={aiIterationToolsData.aiTutorAccess}
      datasetMaker={aiIterationToolsData.datasetMaker}
    />,
    document.getElementById('ai-iteration-tools')
  );
});
