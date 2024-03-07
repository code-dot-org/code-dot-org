import {
  AiCustomizations,
  LevelAiCustomizations,
  Visibility,
} from '@cdo/apps/aichat/types';
import React, {useCallback, useState} from 'react';
import {AppName} from '../../types';
import {
  BodyOneText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import {SimpleDropdown} from '@cdo/apps/componentLibrary/dropdown';
import moduleStyles from './edit-ai-customizations.module.scss';

interface EditAiCustomizationsProps {
  initialCustomizations: LevelAiCustomizations;
  levelName: string;
  appName: AppName;
}

const EditAiCustomizations: React.FunctionComponent<
  EditAiCustomizationsProps
> = ({initialCustomizations, levelName, appName}) => {
  const [aiCustomizations, setAiCustomizations] =
    useState<LevelAiCustomizations>(initialCustomizations);

  const setPropertyVisiblity = useCallback(
    (property: keyof AiCustomizations, visibility: Visibility) => {
      setAiCustomizations({
        ...aiCustomizations,
        [property]: {
          value: aiCustomizations[property]?.value,
          visibility,
        },
      });
    },
    [setAiCustomizations, aiCustomizations]
  );

  return (
    <div>
      <input
        type="hidden"
        id="level_initial_ai_customizations"
        name="level[initial_ai_customizations]"
        value={JSON.stringify(aiCustomizations)}
      />
      <BodyThreeText>
        Set the initial values and visibility for AI model customizations.
        <br />
        <br />
        <b>Editable:</b> students can change the value.
        <br />
        <b>Read Only:</b> students can see the value but cannot change it.
        <br />
        <b>Hidden:</b> the field is not shown on the customization panel.
      </BodyThreeText>
      <div className={moduleStyles.fieldSection}>
        <BodyOneText>Bot Name</BodyOneText>
        <div className={moduleStyles.fieldRow}>
          <div className={moduleStyles.fieldValue}>
            <label htmlFor="botName">Initial Value</label>
            <input
              id="botName"
              type="text"
              value={aiCustomizations.botName?.value || ''}
              onChange={e =>
                setAiCustomizations({
                  ...aiCustomizations,
                  botName: {
                    value: e.target.value,
                    visibility: aiCustomizations.botName?.visibility,
                  },
                })
              }
            />
          </div>
          <VisibilityDropdown
            property="botName"
            setVisibility={setPropertyVisiblity}
          />
        </div>
      </div>
    </div>
  );
};

const VisibilityDropdown: React.FunctionComponent<{
  property: keyof AiCustomizations;
  setVisibility: (
    property: keyof AiCustomizations,
    visibility: Visibility
  ) => void;
}> = ({property, setVisibility}) => {
  return (
    <SimpleDropdown
      labelText="Visibility"
      name="bot_name_visibility"
      size="s"
      items={[
        {value: 'editable', text: 'Editable'},
        {value: 'readonly', text: 'Read Only'},
        {value: 'hidden', text: 'Hidden'},
      ]}
      onChange={e => {
        setVisibility(property, e.target.value as Visibility);
      }}
    />
  );
};

export default EditAiCustomizations;
