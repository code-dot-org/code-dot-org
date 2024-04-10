import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import getScriptData from '@cdo/apps/util/getScriptData';
import AITutorFields from '@cdo/apps/aiTutor/levelEditors/AITutorFields';

$(document).ready(function () {
  const isAvailable = getScriptData('aitutoravailable');
  const aitutorlevelspecificprompt = getScriptData(
    'aitutorlevelspecificprompt'
  );
  console.log('aitutorlevelspecificprompt', aitutorlevelspecificprompt);

  ReactDOM.render(
    <AITutorFields
      isAvailable={isAvailable}
      levelbuilderPrompt={aitutorlevelspecificprompt}
    />,
    document.getElementById('ai-tutor-container')
  );
});
