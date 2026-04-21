import Toggle from '@code-dot-org/component-library/toggle';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {
  DEFAULT_ANSWER_TYPES,
  TUTOR_MODE_TO_ANSWER_TYPE,
} from '@cdo/apps/weblab2/constants';
import {ANSWER_TYPE_CONTRACTS} from '@cdo/apps/weblab2/prompts/promptMaps';
import {
  AiTutorAnswerType,
  AiTutorMode,
  AiTutorPromptSettings,
} from '@cdo/apps/weblab2/types';

import moduleStyles from './edit-ai-tutor-prompt-settings.module.scss';

const TOGGLEABLE_TUTOR_ANSWER_TYPES = [
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
] as const;

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

interface EditAiTutorPromptSettingsProps {
  promptSettings?: AiTutorPromptSettings;
  legacyMode?: AiTutorMode;
}

const EditAiTutorPromptSettings: React.FC<EditAiTutorPromptSettingsProps> = ({
  promptSettings,
  legacyMode,
}) => {
  const [enabledAnswerTypes, setEnabledAnswerTypes] = useState<
    Set<AiTutorAnswerType>
  >(() => {
    if (promptSettings?.answerTypes && promptSettings.answerTypes.length > 0) {
      return new Set(promptSettings.answerTypes);
    } else if (legacyMode) {
      return new Set(TUTOR_MODE_TO_ANSWER_TYPE[legacyMode]);
    } else {
      return new Set(DEFAULT_ANSWER_TYPES);
    }
  });

  const [answerTypeCustomizations, setAnswerTypeCustomizations] = useState<
    Partial<Record<AiTutorAnswerType, string>>
  >(promptSettings?.answerTypeCustomizations ?? {});

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

  const handleCustomizationChange = (
    answerType: AiTutorAnswerType,
    value: string
  ) => {
    setAnswerTypeCustomizations(prev => ({
      ...prev,
      [answerType]: value,
    }));
  };

  return (
    <div>
      <Typography variant="body2" className={moduleStyles.instructions}>
        Choose which answer types you would like the AI tutor to be able to
        respond with. You must specify at least one.
      </Typography>
      <input
        id="level_ai_tutor_prompt_settings"
        type="hidden"
        value={JSON.stringify({
          answerTypes: Array.from(enabledAnswerTypes),
          answerTypeCustomizations: answerTypeCustomizations,
        })}
        name={'level[ai_tutor_prompt_settings]'}
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
                View/add to contract
              </summary>
              <div className={moduleStyles.contractContent}>
                <EnhancedSafeMarkdown
                  markdown={ANSWER_TYPE_CONTRACTS[answerType]}
                />
              </div>
              <textarea
                className={moduleStyles.customizationTextarea}
                disabled={!enabledAnswerTypes.has(answerType)}
                placeholder="Add to contract (optional). Write additional instructions in markdown."
                value={answerTypeCustomizations[answerType] ?? ''}
                onChange={e =>
                  handleCustomizationChange(answerType, e.target.value)
                }
              />
            </details>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditAiTutorPromptSettings;
