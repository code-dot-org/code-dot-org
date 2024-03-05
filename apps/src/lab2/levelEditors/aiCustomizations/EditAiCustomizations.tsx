import {
  AiCustomizations,
  LevelAiCustomizations,
  Visibility,
} from '@cdo/apps/aichat/types';
import React, {useCallback, useState} from 'react';
import {AppName} from '../../types';
import {Heading3} from '@cdo/apps/componentLibrary/typography';
import SimpleDropdown from '@cdo/apps/componentLibrary/simpleDropdown/SimpleDropdown';

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
        id="level_validations"
        name="level[initial_ai_customizations]"
        value={JSON.stringify(aiCustomizations)}
      />
      <div>
        <Heading3>Bot Name</Heading3>
        <input
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
        <VisibilityDropdown
          property="botName"
          setVisibility={setPropertyVisiblity}
        />
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
        {value: 'hidden', text: 'Hidden'},
        {value: 'readonly', text: 'Readonly'},
        {value: 'editable', text: 'Editable'},
      ]}
      onChange={e => {
        setVisibility(property, e.target.value as Visibility);
      }}
    />
  );
};

export default EditAiCustomizations;
