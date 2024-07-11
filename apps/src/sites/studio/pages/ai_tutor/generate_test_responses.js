import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import AITutorResponseGenerator from '@cdo/apps/lib/levelbuilder/ai-tutor/AITutorResponseGenerator';

$(document).ready(() => {
  const aiTutorTesterData = getScriptData('aiTutorTester');
  const canRequestBulkAITutorResponses = aiTutorTesterData.allowed;

  ReactDOM.render(
    <AITutorResponseGenerator allowed={canRequestBulkAITutorResponses} />,
    document.getElementById('generator')
  );
});
