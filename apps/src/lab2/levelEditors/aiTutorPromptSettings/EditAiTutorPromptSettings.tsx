import Toggle from '@code-dot-org/component-library/toggle';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {TUTOR_MODE_TO_ANSWER_TYPE} from '@cdo/apps/weblab2/constants';
import {
  AiTutorAnswerType,
  AiTutorMode,
  DEFAULT_AI_TUTOR_MODE,
} from '@cdo/apps/weblab2/types';

import moduleStyles from './edit-ai-tutor-prompt-settings.module.scss';

const TOGGLEABLE_TUTOR_MODES = [
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

const MODE_TO_LABEL = {
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
  const [enabledModes, setEnabledModes] = useState<Set<AiTutorAnswerType>>(
    () => {
      if (answerTypes && answerTypes.length > 0) {
        return new Set(answerTypes);
      } else if (legacyMode) {
        return new Set(TUTOR_MODE_TO_ANSWER_TYPE[legacyMode]);
      } else {
        return new Set(TUTOR_MODE_TO_ANSWER_TYPE[DEFAULT_AI_TUTOR_MODE]);
      }
    }
  );

  const handleToggle = (mode: AiTutorAnswerType, checked: boolean) => {
    setEnabledModes(prev => {
      const updatedAnswerTypes = new Set(prev);
      if (checked) {
        updatedAnswerTypes.add(mode);
      } else {
        updatedAnswerTypes.delete(mode);
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
        value={JSON.stringify(Array.from(enabledModes))}
        name={'level[ai_tutor_prompt_answer_types]'}
      />
      <div className={moduleStyles.togglesContainer}>
        {TOGGLEABLE_TUTOR_MODES.map(mode => (
          <Toggle
            key={mode}
            name={mode}
            label={MODE_TO_LABEL[mode]}
            checked={enabledModes.has(mode)}
            onChange={e => handleToggle(mode, e.target.checked)}
          />
        ))}
      </div>
    </div>
  );
};

export default EditAiTutorPromptSettings;
