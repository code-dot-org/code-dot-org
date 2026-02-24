import Toggle from '@code-dot-org/component-library/toggle';
import {Typography} from '@mui/material';
import React, {useState} from 'react';

import {AiTutorMode} from '../types';

const TOGGLEABLE_TUTOR_MODES: AiTutorMode[] = [
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

type LegacyMode =
  | 'suggest'
  | 'outline'
  | 'guide'
  | 'produce'
  | 'designer'
  | 'tutor'
  | 'engineer'
  | 'qa';

interface EditAiTutorPromptSettingsProps {
  answerTypes?: AiTutorMode[];
  legacyMode?: LegacyMode;
}

const legacyModeToAnswerTypeMap: Record<LegacyMode, AiTutorMode[]> = {
  suggest: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
  ],
  // TODO: outline and guide may need to be adjusted
  outline: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
  ],
  guide: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
  ],
  produce: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
  ],
  designer: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
  ],
  tutor: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
  ],
  engineer: [
    'buildHTML',
    'buildCSS',
    'buildJavaScript',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
  ],
  qa: [
    'buildHTML',
    'buildCSS',
    'ask',
    'hint',
    'debug',
    'example',
    'explainCode',
    'documentation',
    'pseudocode',
    'testCase',
  ],
};

const EditAiTutorPromptSettings: React.FC<EditAiTutorPromptSettingsProps> = ({
  answerTypes,
  legacyMode,
}) => {
  const [enabledModes, setEnabledModes] = useState<Set<AiTutorMode>>(() => {
    if (answerTypes && answerTypes.length > 0) {
      return new Set(answerTypes);
    } else if (legacyMode) {
      return new Set(legacyModeToAnswerTypeMap[legacyMode]);
    } else {
      return new Set();
    }
  });

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
