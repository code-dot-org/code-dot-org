import Toggle from '@code-dot-org/component-library/toggle';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {AiTutorMode} from '../types';

const ALL_AI_TUTOR_MODES: AiTutorMode[] = [
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
  'refusal',
  'refusalJavaScriptSnippets',
  'testCase',
];

interface EditAiTutorPromptSettingsProps {
  answerTypes: AiTutorMode[];
}

const EditAiTutorPromptSettings: React.FC<EditAiTutorPromptSettingsProps> = ({
  answerTypes,
}) => {
  const [enabledModes, setEnabledModes] = useState<Set<AiTutorMode>>(
    new Set(answerTypes)
  );

  const handleToggle = (mode: AiTutorMode, checked: boolean) => {
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
      {ALL_AI_TUTOR_MODES.map(mode => (
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
