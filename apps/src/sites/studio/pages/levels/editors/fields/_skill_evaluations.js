import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';

import SkillEvaluationSettings from '@cdo/apps/levelbuilder/skills/SkillEvaluationSettings';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const aiPromptModificationInput = $(
    'input#level_additional_ai_evaluation_instructions'
  );
  const data = getScriptData('skillevaluationdata');
  ReactDOM.render(
    <SkillEvaluationSettings
      skills={data.skills}
      levelId={data.levelId}
      systemPrompt={data.systemPrompt}
      additionalAiEvaluationInstructions={
        data.additionalAiEvaluationInstructions
      }
      updateAdditionalAiEvaluationInstructions={newInstructions =>
        aiPromptModificationInput.val(newInstructions)
      }
    />,
    document.getElementById('skill-evaluation-settings-editor')
  );
});
