import React, {useCallback, useState} from 'react';

import {
  BodyFourText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import {
  AiCustomizations,
  LevelAichatSettings,
  ModelCardInfo,
  Visibility,
} from '@cdo/apps/aichat/types';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {
  MAX_RETRIEVAL_CONTEXTS,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  SET_TEMPERATURE_STEP,
  DEFAULT_LEVEL_AICHAT_SETTINGS,
} from '@cdo/apps/aichat/views/modelCustomization/constants';
import MultiItemInput from '@cdo/apps/templates/MultiItemInput';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

import FieldSection from './FieldSection';
import ModelCardFields from './ModelCardFields';
import ModelSelectionFields from './ModelSelectionFields';
import VisibilityDropdown from './VisibilityDropdown';
import {UpdateContext} from './UpdateContext';
import moduleStyles from './edit-aichat-settings.module.scss';

/**
 * Editor for the AI Customizations on the level edit page.
 */
const EditAichatSettings: React.FunctionComponent<{
  initialSettings: LevelAichatSettings;
}> = ({initialSettings}) => {
  const [aichatSettings, setAichatSettings] = useState<LevelAichatSettings>(
    initialSettings || DEFAULT_LEVEL_AICHAT_SETTINGS
  );

  const {initialCustomizations, visibilities} = aichatSettings;
  const {retrievalContexts} = initialCustomizations;

  const setPropertyVisibility = useCallback(
    (property: keyof AiCustomizations, visibility: Visibility) => {
      setAichatSettings({
        ...aichatSettings,
        visibilities: {
          ...visibilities,
          [property]: visibility,
        },
      });
    },
    [setAichatSettings, aichatSettings, visibilities]
  );

  const setPropertyValue = useCallback(
    (
      property: keyof AiCustomizations,
      value: AiCustomizations[keyof AiCustomizations]
    ) => {
      setAichatSettings({
        ...aichatSettings,
        initialCustomizations: {
          ...initialCustomizations,
          [property]: value,
        },
      });
    },
    [setAichatSettings, aichatSettings, initialCustomizations]
  );

  const setModelCardPropertyValue = useCallback(
    (
      property: keyof ModelCardInfo,
      value: ModelCardInfo[keyof ModelCardInfo]
    ) => {
      setAichatSettings({
        ...aichatSettings,
        initialCustomizations: {
          ...initialCustomizations,
          modelCardInfo: {
            ...initialCustomizations.modelCardInfo,
            [property]: value,
          },
        },
      });
    },
    [aichatSettings, setAichatSettings, initialCustomizations]
  );

  const setAvailableModelsSetting = useCallback(
    (availableModelIds: string[]) => {
      setAichatSettings({
        ...aichatSettings,
        availableModelIds: availableModelIds,
      });
    },
    [aichatSettings, setAichatSettings]
  );

  return (
    <UpdateContext.Provider
      value={{
        aichatSettings,
        setPropertyVisibility,
        setPropertyValue,
        setModelCardPropertyValue,
        setAvailableModelsSetting,
      }}
    >
      <div>
        <input
          type="hidden"
          id="level_aichat_settings"
          name="level[aichat_settings]"
          value={JSON.stringify(aichatSettings)}
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
        <ModelSelectionFields />
        <FieldSection
          fieldName="temperature"
          labelText="Temperature"
          inputType="number"
          min={MIN_TEMPERATURE}
          max={MAX_TEMPERATURE}
          step={SET_TEMPERATURE_STEP}
          description="Temperature setting for the model. A higher temperature induces more randomness."
        />
        <FieldSection
          fieldName="systemPrompt"
          labelText="System Prompt"
          description="The base prompt applied to all inputs to the model."
          inputType="textarea"
        />
        <FieldSection
          fieldName="retrievalContexts"
          labelText="Retrieval Contexts"
          description="Pieces of information the model references when generating a response."
          inputType="custom"
          inputNode={
            <MultiItemInput
              items={retrievalContexts}
              onAdd={() => {
                setPropertyValue(
                  'retrievalContexts',
                  retrievalContexts.concat('')
                );
              }}
              onRemove={() => {
                setPropertyValue(
                  'retrievalContexts',
                  retrievalContexts.slice(0, -1)
                );
              }}
              onChange={(index, value) => {
                const updatedContexts = retrievalContexts.slice();
                updatedContexts[index] = value;
                setPropertyValue('retrievalContexts', updatedContexts);
              }}
              multiline={true}
              max={MAX_RETRIEVAL_CONTEXTS}
            />
          }
        />
        <div className={moduleStyles.fieldSection}>
          <hr />
          <CollapsibleSection title="Model Card">
            <div className={moduleStyles.fieldRow}>
              <ModelCardFields />
              <VisibilityDropdown
                value={visibilities.modelCardInfo}
                property="modelCardInfo"
              />
            </div>
          </CollapsibleSection>
        </div>
        <div className={moduleStyles.fieldSection}>
          <hr />
          <CollapsibleSection title="Additional Configuration">
            <BodyFourText>
              <i>
                Students always have access to the Edit View, where they can
                customize their chatbot. Published chatbots are able to be
                viewed in a Presentation View which mimics a user-centered
                experience by hiding instructions and displaying the model card.
                This setting will also hide the "Publish" tab of the model
                customization area in the Edit View, since students cannot
                publish their work when this setting is enabled. Use the setting
                below to hide the option to enter presentation view in a level.
              </i>
            </BodyFourText>
            <div className={moduleStyles.fieldRow}>
              <label
                htmlFor="hidePresentationPanel"
                className={moduleStyles.inlineLabel}
              >
                Hide Presentation Panel
              </label>
              <Checkbox
                name="hidePresentationPanel"
                checked={aichatSettings.hidePresentationPanel}
                onChange={e => {
                  setAichatSettings({
                    ...aichatSettings,
                    hidePresentationPanel: e.target.checked,
                  });
                }}
              />
            </div>
          </CollapsibleSection>
        </div>
        <hr />
      </div>
    </UpdateContext.Provider>
  );
};

export default EditAichatSettings;
