import React, {useContext, useState, useCallback} from 'react';

import {modelDescriptions} from '@cdo/apps/aichat/constants';
import {Visibility} from '@cdo/apps/aichat/types';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';
import {BodyFourText} from '@cdo/apps/componentLibrary/typography';

import CollapsibleFieldSection from './CollapsibleFieldSection';
import {UpdateContext} from './UpdateContext';

import moduleStyles from './edit-aichat-settings.module.scss';

const modelDropdownItems = modelDescriptions.map(model => {
  return {value: model.id, text: model.name};
});

const ModelSelectionFields: React.FunctionComponent = () => {
  const {setModelSelectionValues, aichatSettings} = useContext(UpdateContext);
  const shouldDisableAdditionalModelSelection =
    aichatSettings.visibilities.selectedModelId !== Visibility.EDITABLE;
  const selectedModelId = aichatSettings.initialCustomizations.selectedModelId;
  const [additionalAvailableModelIds, setAdditionalAvailableModelIds] =
    useState<string[]>(
      aichatSettings.availableModelIds?.filter(id => id !== selectedModelId) ||
        []
    );

  const onDropdownChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setModelSelectionValues(additionalAvailableModelIds, e.target.value);
    },
    [additionalAvailableModelIds, setModelSelectionValues]
  );

  const onCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      let newAdditionalAvailableModelIds;
      if (e.target.checked) {
        newAdditionalAvailableModelIds = [
          ...additionalAvailableModelIds,
          e.target.name,
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
          <BodyFourText>
            <i>
              Models available to the student to select from and compare to each
              other. If making this setting editable, it's best practice to
              select at least 2 models so students have something to compare -
              otherwise, consider making this read only or hidden.
            </i>
          </BodyFourText>
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
        </>
      }
    />
  );
};

export default ModelSelectionFields;
