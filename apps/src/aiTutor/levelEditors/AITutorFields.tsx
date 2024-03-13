import React, {useState} from 'react';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './edit-ai-customizations.module.scss';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';

interface AITutorFieldsProps {
  isAvailable: boolean;
  levelbuilderPrompt: string;
}

const AITutorFields: React.FunctionComponent<AITutorFieldsProps> = ({
  isAvailable,
  levelbuilderPrompt,
}) => {
  const [aiTutorAvailable, setaiTutorAvailable] =
    useState<boolean>(isAvailable);

  const [levelSpecificPrompt, setlevelSpecificPrompt] =
    useState<string>(levelbuilderPrompt);

  return (
    <div>
      <input
        type="hidden"
        id="level_ai_tutor_level_specific_prompt"
        name="level[ai_tutor_level_specific_prompt]"
        value={levelSpecificPrompt}
      />
      <BodyThreeText>
        Set the level-specific prompt.
        <br />
      </BodyThreeText>
      <div className={moduleStyles.fieldSection}>
        <div className={moduleStyles.fieldRow}>
          <label
            htmlFor="aiTutorAvailableCheckbox"
            className={moduleStyles.inlineLabel}
          >
            Enable AI Tutor on Level
          </label>
          <Checkbox
            name="aiTutorAvailableCheckbox"
            checked={aiTutorAvailable || false}
            onChange={e => {
              setaiTutorAvailable(e.target.checked);
            }}
          />
        </div>
        <div className={moduleStyles.fieldRow}>
          <div className={moduleStyles.fieldValue}>
            <label htmlFor="levelPrompt">Level-Specific Prompt</label>
            <input
              id="levelPrompt"
              type="text"
              value={levelSpecificPrompt || ''}
              onChange={e => {
                setlevelSpecificPrompt(e.target.value);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITutorFields;
