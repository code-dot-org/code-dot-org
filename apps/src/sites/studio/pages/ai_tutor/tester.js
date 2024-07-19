import React from 'react';
import ReactDOM from 'react-dom';

import AITutorTester from '@cdo/apps/lib/levelbuilder/ai-tutor/AITutorTester';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const aiTutorTesterData = getScriptData('aiTutorTester');
  const canRequestBulkAITutorResponses = aiTutorTesterData.allowed;

  ReactDOM.render(
    <AITutorTester allowed={canRequestBulkAITutorResponses} />,
    document.getElementById('tester')
  );
});
