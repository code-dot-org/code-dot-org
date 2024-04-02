import React, {useState} from 'react';
import moduleStyles from '@cdo/apps/lab2/levelEditors/aiCustomizations/edit-ai-customizations.module.scss';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';

interface AITutorFieldsProps {
  isAvailable: boolean;
  levelbuilderPrompt: string;
}

const AITutorFields: React.FunctionComponent<AITutorFieldsProps> = ({
  isAvailable,
  levelbuilderPrompt,
}) => {
  const [aiTutorAvailable, setAiTutorAvailable] =
    useState<boolean>(isAvailable);
  const [levelSpecificPrompt, setlevelSpecificPrompt] =
    useState<string>(levelbuilderPrompt);

  return (
    <div>
      <input
        type="hidden"
        id="level_ai_tutor_available"
        name="level[ai_tutor_available]"
        value={aiTutorAvailable.toString()}
      />

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
              setAiTutorAvailable(!aiTutorAvailable);
            }}
          />
        </div>
        <br />

        <input
          type="hidden"
          id="level_ai_tutor_level_specific_prompt"
          name="level[ai_tutor_level_specific_prompt]"
          value={levelSpecificPrompt.toString()}
        />
        {aiTutorAvailable && (
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
        )}
      </div>
    </div>
  );
};

export default AITutorFields;
