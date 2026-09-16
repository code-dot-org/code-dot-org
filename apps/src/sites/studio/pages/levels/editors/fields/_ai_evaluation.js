import $ from 'jquery';
import React from 'react';

import AiEvaluationSettings from '@cdo/apps/levelbuilder/aiEvaluation/AiEvaluationSettings';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

$(document).ready(function () {
  const aiPromptModificationInput = $(
    'input#level_additional_ai_evaluation_instructions'
  );
  const data = getScriptData('aievaluationdata');
  createReactRoot(
    <AiEvaluationSettings
      levelId={data.levelId}
      systemPrompt={data.systemPrompt}
      additionalAiEvaluationInstructions={
        data.additionalAiEvaluationInstructions
      }
      updateAdditionalAiEvaluationInstructions={newInstructions =>
        aiPromptModificationInput.val(newInstructions)
      }
    />,
    document.getElementById('ai-evaluation-settings-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
