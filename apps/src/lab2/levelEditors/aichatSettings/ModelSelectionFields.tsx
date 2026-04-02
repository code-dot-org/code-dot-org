import Checkbox from '@code-dot-org/component-library/checkbox';
import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import {Typography} from '@mui/material';
import React, {useContext, useState, useCallback, useMemo} from 'react';

import {modelDescriptions} from '@cdo/apps/aichat/constants';
import {Visibility} from '@cdo/apps/aichat/types';
import {ValueOf} from '@cdo/apps/types/utils';
import {AiChatModelIds} from '@cdo/generated-scripts/sharedConstants';

import CollapsibleFieldSection from './CollapsibleFieldSection';
import {UpdateContext} from './UpdateContext';

import moduleStyles from './edit-aichat-settings.module.scss';

const modelDropdownItems = modelDescriptions.map(model => {
  return {value: model.id, text: model.name};
});

const ModelSelectionFields: React.FunctionComponent = () => {
  const {setModelSelectionValues, setMultimodalEnabled, aichatSettings} =
    useContext(UpdateContext);
  const shouldDisableAdditionalModelSelection =
    aichatSettings.visibilities.selectedModelId !== Visibility.EDITABLE;
  const selectedModelId = aichatSettings.initialCustomizations.selectedModelId;
  const [additionalAvailableModelIds, setAdditionalAvailableModelIds] =
    useState<ValueOf<typeof AiChatModelIds>[]>(
      aichatSettings.availableModelIds?.filter(id => id !== selectedModelId) ||
        []
    );

  const onDropdownChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setModelSelectionValues(
        additionalAvailableModelIds,
        e.target.value as ValueOf<typeof AiChatModelIds>
      );
    },
    [additionalAvailableModelIds, setModelSelectionValues]
  );

  const onCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newAdditionalAvailableModelIds: ValueOf<typeof AiChatModelIds>[];
      if (e.target.checked) {
        newAdditionalAvailableModelIds = [
          ...additionalAvailableModelIds,
          e.target.name as ValueOf<typeof AiChatModelIds>,
        ];
      } else {
        newAdditionalAvailableModelIds = additionalAvailableModelIds.filter(
          id => id !== e.target.name
        );
      }
      setAdditionalAvailableModelIds(newAdditionalAvailableModelIds);
      setModelSelectionValues(newAdditionalAvailableModelIds, selectedModelId);
    },
    [additionalAvailableModelIds, selectedModelId, setModelSelectionValues]
  );

  const multimodalIncluded = useMemo(() => {
    return aichatSettings.availableModelIds.some(
      id => modelDescriptions.find(model => model.id === id)?.multimodal
    );
  }, [aichatSettings.availableModelIds]);

  return (
    <CollapsibleFieldSection
      fieldName="selectedModelId"
      labelText="Model Selection"
      description="The initial model selected for the chatbot."
      inputType="custom"
      inputNode={
        <>
          <SimpleDropdown
            labelText=""
            onChange={onDropdownChange}
            items={modelDropdownItems}
            selectedValue={selectedModelId}
            name="model"
            size="s"
          />
          <br />
          <Typography variant="body4" gutterBottom>
            <i>
              Models available to the student to select from and compare to each
              other. If making this setting editable, it's best practice to
              select at least 2 models so students have something to compare -
              otherwise, consider making this read only or hidden.
            </i>
          </Typography>
          {modelDescriptions.map(model => {
            return (
              <div key={model.id} className={moduleStyles.fieldRow}>
                <Checkbox
                  key={model.id}
                  name={model.id}
                  label={model.name}
                  checked={
                    additionalAvailableModelIds.includes(model.id) ||
                    model.id === selectedModelId
                  }
                  disabled={
                    model.id === selectedModelId ||
                    shouldDisableAdditionalModelSelection
                  }
                  onChange={onCheckboxChange}
                />
              </div>
            );
          })}
          <br />
          {multimodalIncluded && (
            <>
              <Typography variant="body4" gutterBottom>
                <i>
                  Enables multimodal chat (allow uploading files and receiving
                  images, if possible).
                  <br />
                  <b>IMPORTANT:</b> If using an image model like Gemini 2.5
                  Flash Image, this setting MUST be enabled for generated images
                  to appear in the chat.
                </i>
              </Typography>
              <div className={moduleStyles.fieldRow}>
                <label
                  htmlFor="multimodalEnabled"
                  className={moduleStyles.inlineLabel}
                >
                  Enable Multimodal Chat
                </label>
                <Checkbox
                  name="multimodalEnabled"
                  checked={aichatSettings.multimodalEnabled || false}
                  onChange={e => setMultimodalEnabled(e.target.checked)}
                />
              </div>
            </>
          )}
        </>
      }
    />
  );
};

export default ModelSelectionFields;
