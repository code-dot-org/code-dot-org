import Toggle from '@code-dot-org/component-library/toggle';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {TUTOR_MODE_TO_ANSWER_TYPE} from '@cdo/apps/weblab2/constants';
import {AiTutorAnswerType, AiTutorMode} from '@cdo/apps/weblab2/types';

const TOGGLEABLE_TUTOR_MODES: AiTutorAnswerType[] = [
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
];

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
        return new Set();
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
      <Typography variant="h3">AI Tutor Prompt Settings</Typography>
      <input
        id="level_ai_tutor_prompt_answer_types"
        type="hidden"
        value={JSON.stringify(Array.from(enabledModes))}
        name={'level[ai_tutor_prompt_answer_types]'}
      />
      {TOGGLEABLE_TUTOR_MODES.map(mode => (
        <Toggle
          key={mode}
          name={mode}
          label={mode}
          checked={enabledModes.has(mode)}
          onChange={e => handleToggle(mode, e.target.checked)}
        />
      ))}
    </div>
  );
};

export default EditAiTutorPromptSettings;
