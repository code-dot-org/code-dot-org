import Toggle from '@code-dot-org/component-library/toggle';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {
  DEFAULT_AI_TUTOR_MODE,
  TUTOR_MODE_TO_ANSWER_TYPE,
} from '@cdo/apps/weblab2/constants';
import askContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/ask.md';
import buildCSSContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildCSS.md';
import buildHTMLContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildHTML.md';
import buildJavaScriptContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/buildJavaScript.md';
import debugContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/debug.md';
import documentationContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/documentation.md';
import exampleContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/example.md';
import explainCodeContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/explainCode.md';
import hintContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/hint.md';
import pseudocodeContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/pseudocode.md';
import testCaseContract from '@cdo/apps/weblab2/prompts/answerTypeContracts/testCase.md';
import {AiTutorAnswerType, AiTutorMode} from '@cdo/apps/weblab2/types';

import moduleStyles from './edit-ai-tutor-prompt-settings.module.scss';

const ANSWER_TYPE_TO_CONTRACT: Record<string, string> = {
  ask: askContract,
  buildCSS: buildCSSContract,
  buildHTML: buildHTMLContract,
  buildJavaScript: buildJavaScriptContract,
  debug: debugContract,
  documentation: documentationContract,
  example: exampleContract,
  explainCode: explainCodeContract,
  hint: hintContract,
  pseudocode: pseudocodeContract,
  testCase: testCaseContract,
};

const TOGGLEABLE_TUTOR_ANSWER_TYPES = [
  'ask',
  'buildCSS',
  'buildHTML',
  'buildJavaScript',
  'debug',
  'documentation',
  'example',
  'explainCode',
  'hint',
  'pseudocode',
  'testCase',
] as const;

const ANSWER_TYPE_TO_LABEL = {
  ask: 'Ask',
  buildCSS: 'Build CSS',
  buildHTML: 'Build HTML',
  buildJavaScript: 'Build JavaScript',
  debug: 'Debug',
  documentation: 'Documentation',
  example: 'Example',
  explainCode: 'Explain Code',
  hint: 'Hint',
  pseudocode: 'Pseudocode',
  testCase: 'Test Case',
};

interface EditAiTutorPromptSettingsProps {
  answerTypes?: AiTutorAnswerType[];
  legacyMode?: AiTutorMode;
}

const EditAiTutorPromptSettings: React.FC<EditAiTutorPromptSettingsProps> = ({
  answerTypes,
  legacyMode,
}) => {
  const [enabledAnswerTypes, setEnabledAnswerTypes] = useState<
    Set<AiTutorAnswerType>
  >(() => {
    if (answerTypes && answerTypes.length > 0) {
      return new Set(answerTypes);
    } else if (legacyMode) {
      return new Set(TUTOR_MODE_TO_ANSWER_TYPE[legacyMode]);
    } else {
      return new Set(TUTOR_MODE_TO_ANSWER_TYPE[DEFAULT_AI_TUTOR_MODE]);
    }
  });

  const handleToggle = (answerType: AiTutorAnswerType, checked: boolean) => {
    setEnabledAnswerTypes(prev => {
      const updatedAnswerTypes = new Set(prev);
      if (checked) {
        updatedAnswerTypes.add(answerType);
      } else {
        updatedAnswerTypes.delete(answerType);
      }
      return updatedAnswerTypes;
    });
  };

  return (
    <div>
      <Typography variant="body2" className={moduleStyles.instructions}>
        Choose which answer types you would like the AI tutor to be able to
        respond with. You must specify at least one.
      </Typography>
      <input
        id="level_ai_tutor_prompt_answer_types"
        type="hidden"
        value={JSON.stringify(Array.from(enabledAnswerTypes))}
        name={'level[ai_tutor_prompt_answer_types]'}
      />
      <div className={moduleStyles.togglesContainer}>
        {TOGGLEABLE_TUTOR_ANSWER_TYPES.map(answerType => (
          <div key={answerType}>
            <Toggle
              name={answerType}
              label={ANSWER_TYPE_TO_LABEL[answerType]}
              checked={enabledAnswerTypes.has(answerType)}
              onChange={e => handleToggle(answerType, e.target.checked)}
            />
            <details className={moduleStyles.contractDetails}>
              <summary className={moduleStyles.contractSummary}>
                View contract
              </summary>
              <div className={moduleStyles.contractContent}>
                <EnhancedSafeMarkdown
                  markdown={ANSWER_TYPE_TO_CONTRACT[answerType]}
                />
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditAiTutorPromptSettings;
