import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
//import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import getScriptData from '@cdo/apps/util/getScriptData';
import AITutorFields from '@cdo/apps/aiTutor/levelEditors/AITutorFields';

$(document).ready(function () {
  const isAvailable = getScriptData('aitutoravailable');
  console.log('isAvailable', isAvailable);
  // const levelbuilderPrompt = getScriptData('levelbuilderprompt');
  // console.log('isAvailable', isAvailable);

  ReactDOM.render(
    <AITutorFields
      isAvailable={isAvailable}
      // levelbuilderPrompt={levelbuilderPrompt}
    />,
    document.getElementById('ai-tutor-container')
  );
});
