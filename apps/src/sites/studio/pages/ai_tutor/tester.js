import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import AITutorTester from '@cdo/apps/lib/levelbuilder/ai-tutor/AITutorTester';

$(document).ready(() => {
  const aiTutorTesterData = getScriptData('aiTutorTester');
  const canRequestBulkAITutorResponses = aiTutorTesterData.allowed;

  ReactDOM.render(
    <AITutorTester allowed={canRequestBulkAITutorResponses} />,
    document.getElementById('tester')
  );
});
