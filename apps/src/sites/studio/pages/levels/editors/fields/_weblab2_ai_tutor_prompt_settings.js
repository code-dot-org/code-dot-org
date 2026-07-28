import $ from 'jquery';
import React from 'react';

import EditAiTutorPromptSettings from '@cdo/apps/lab2/levelEditors/aiTutorPromptSettings/EditAiTutorPromptSettings';
import {createReactRoot} from '@cdo/apps/util/createReactRoot';
import getScriptData from '@cdo/apps/util/getScriptData';
import {
  DEFAULT_ANSWER_TYPES,
  TUTOR_MODE_TO_ANSWER_TYPE,
} from '@cdo/apps/weblab2/constants';
import {ANSWER_TYPE_CONTRACTS} from '@cdo/apps/weblab2/prompts/promptMaps';

const TOGGLEABLE_ANSWER_TYPES = [
  'ask',
  'buildCSS',
  'buildHTML',
  'buildJavaScript',
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
  buildCSS: 'Build CSS',
  buildHTML: 'Build HTML',
  buildJavaScript: 'Build JavaScript',
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
  const legacyMode = document.querySelector('script[data-legacymode]').dataset
    .legacymode;

  createReactRoot(
    <EditAiTutorPromptSettings
      promptSettings={promptSettings}
      legacyMode={legacyMode}
      legacyModeToAnswerType={TUTOR_MODE_TO_ANSWER_TYPE}
      toggleableAnswerTypes={TOGGLEABLE_ANSWER_TYPES}
      answerTypeToLabel={ANSWER_TYPE_TO_LABEL}
      answerTypeContracts={ANSWER_TYPE_CONTRACTS}
      defaultAnswerTypes={DEFAULT_ANSWER_TYPES}
    />,
    document.getElementById('ai-tutor-prompt-settings-editor'),
    {
      legacyReactDomRender: true,
    }
  );
});
