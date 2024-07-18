import React from 'react';
import {createRoot} from 'react-dom/client';

import AITutorTester from '@cdo/apps/lib/levelbuilder/ai-tutor/AITutorTester';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(() => {
  const aiTutorTesterData = getScriptData('aiTutorTester');
  const canRequestBulkAITutorResponses = aiTutorTesterData.allowed;

  const root = createRoot(document.getElementById('tester'));
  root.render(<AITutorTester allowed={canRequestBulkAITutorResponses} />);
});
