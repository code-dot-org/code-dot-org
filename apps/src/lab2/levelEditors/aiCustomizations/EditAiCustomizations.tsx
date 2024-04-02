import {
  AiCustomizations,
  LevelAiCustomizations,
  ModelCardInfo,
  Visibility,
} from '@cdo/apps/aichat/types';
import React, {useCallback, useState} from 'react';
import {
  BodyFourText,
  BodyThreeText,
} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './edit-ai-customizations.module.scss';
import {
  MAX_RETRIEVAL_CONTEXTS,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  SET_TEMPERATURE_STEP,
  EMPTY_MODEL_CARD_INFO,
  EMPTY_AI_CUSTOMIZATIONS,
} from '@cdo/apps/aichat/views/modelCustomization/constants';
import MultiItemInput from './MultiItemInput';
import FieldSection from './FieldSection';
import ModelCardFields from './ModelCardFields';
import VisibilityDropdown from './VisibilityDropdown';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import {UpdateContext} from './UpdateContext';
import CollapsibleSection from '@cdo/apps/templates/CollapsibleSection';

// Make sure all fields have a visibility specified.
function sanitizeData(data: LevelAiCustomizations): LevelAiCustomizations {
  for (const key of Object.keys(data)) {
    if (key === 'hidePresentationPanel') {
      continue;
    }
    const field = data[key as keyof AiCustomizations];
    if (field === undefined) {
      continue;
    }
    if (field.visibility === undefined) {
      field.visibility = Visibility.EDITABLE;
    }
  }
  return data;
}

/**
 * Editor for the AI Customizations on the level edit page.
 */
const EditAiCustomizations: React.FunctionComponent<{
  initialCustomizations: LevelAiCustomizations;
}> = ({initialCustomizations}) => {
  const [aiCustomizations, setAiCustomizations] =
    useState<LevelAiCustomizations>(
      initialCustomizations || EMPTY_AI_CUSTOMIZATIONS
    );

  const setPropertyVisibility = useCallback(
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

  const setPropertyValue = useCallback(
    (property: keyof AiCustomizations, value: string | number | string[]) => {
      setAiCustomizations({
        ...aiCustomizations,
        [property]: {
          value,
          visibility: aiCustomizations[property]?.visibility,
        },
      });
    },
    [setAiCustomizations, aiCustomizations]
  );

  const setModelCardPropertyValue = useCallback(
    (property: keyof ModelCardInfo, value: string | string[]) => {
      const updatedModelCardInfo: ModelCardInfo = {
        ...(aiCustomizations.modelCardInfo?.value || EMPTY_MODEL_CARD_INFO),
        [property]: value,
      };

      setAiCustomizations({
        ...aiCustomizations,
        modelCardInfo: {
          value: updatedModelCardInfo,
          visibility:
            aiCustomizations.modelCardInfo?.visibility || Visibility.EDITABLE,
        },
      });
    },
    [aiCustomizations, setAiCustomizations]
  );

  return (
    <UpdateContext.Provider
      value={{
        aiCustomizations,
        setPropertyVisibility,
        setPropertyValue,
        setModelCardPropertyValue,
      }}
    >
      <div>
        <input
          type="hidden"
          id="level_initial_ai_customizations"
          name="level[initial_ai_customizations]"
          value={JSON.stringify(sanitizeData(aiCustomizations))}
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
        <FieldSection
          fieldName="botName"
          labelText="Bot Name"
          inputType="text"
          description="Name of the chat bot."
        />
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
              items={aiCustomizations.retrievalContexts?.value || []}
              onAdd={() => {
                setPropertyValue(
                  'retrievalContexts',
                  aiCustomizations.retrievalContexts?.value?.concat('') || ['']
                );
              }}
              onRemove={() => {
                setPropertyValue(
                  'retrievalContexts',
                  aiCustomizations.retrievalContexts?.value?.slice(0, -1) || []
                );
              }}
              onChange={(index, value) => {
                const updatedContexts =
                  aiCustomizations.retrievalContexts.value.slice();
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
                value={
                  aiCustomizations.modelCardInfo?.visibility ||
                  Visibility.EDITABLE
                }
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
                Use the setting below to hide the option to enter presentation
                view in a level.
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
                checked={aiCustomizations.hidePresentationPanel || false}
                onChange={e => {
                  setAiCustomizations({
                    ...aiCustomizations,
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

export default EditAiCustomizations;
