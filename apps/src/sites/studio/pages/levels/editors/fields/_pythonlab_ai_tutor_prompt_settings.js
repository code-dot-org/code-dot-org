import $ from 'jquery';
import React from 'react';

import EditAiTutorPromptSettings from '@cdo/apps/lab2/levelEditors/aiTutorPromptSettings/EditAiTutorPromptSettings';
import {DEFAULT_ANSWER_TYPES} from '@cdo/apps/pythonlab/helpers/aiTutorPromptGenerator';
import {ANSWER_TYPE_CONTRACTS} from '@cdo/apps/pythonlab/prompts/promptMaps';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';

const TOGGLEABLE_ANSWER_TYPES = [
  'ask',
  'buildPython',
  'buildCSV',
  'buildJSON',
  'debug',
  'documentation',
  'example',
  'explainCode',
  'hint',
  'pseudocode',
  'testCase',
];

const ANSWER_TYPE_TO_LABEL = {
  ask: 'Ask',
  buildPython: 'Build Python',
  buildCSV: 'Build CSV',
  buildJSON: 'Build JSON',
  debug: 'Debug',
  documentation: 'Documentation',
  example: 'Example',
  explainCode: 'Explain Code',
  hint: 'Hint',
  pseudocode: 'Pseudocode',
  testCase: 'Test Case',
};

$(document).ready(function () {
  const promptSettings = getScriptData('promptsettings');

  createReactRoot(
    <EditAiTutorPromptSettings
      promptSettings={promptSettings}
      toggleableAnswerTypes={TOGGLEABLE_ANSWER_TYPES}
      answerTypeToLabel={ANSWER_TYPE_TO_LABEL}
      answerTypeContracts={ANSWER_TYPE_CONTRACTS}
      defaultAnswerTypes={DEFAULT_ANSWER_TYPES}
    />,
    document.getElementById('pythonlab-ai-tutor-prompt-settings-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
