import React, {useContext, useState} from 'react';

import {BodyFourText} from '@cdo/apps/componentLibrary/typography';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';

import {modelDescriptions} from '@cdo/apps/aichat/constants';
import moduleStyles from './edit-aichat-settings.module.scss';
import {UpdateContext} from './UpdateContext';
import FieldSection from './FieldSection';

const ModelSelectionFields: React.FunctionComponent = () => {
  const {setPropertyValue, setAvailableModelsSetting, aichatSettings} =
    useContext(UpdateContext);
  const [additionalAvailableModelIds, setAdditionalAvailableModelIds] =
    useState<Set<string>>(
      new Set(
        aichatSettings.availableModelIds.filter(
          id => id !== aichatSettings.initialCustomizations.selectedModelId
        )
      )
    );
  const selectedModelId = aichatSettings.initialCustomizations.selectedModelId;

  const updateAvailableModels = () => {
    console.log('updating available models');
    console.log(selectedModelId);
    setAvailableModelsSetting(
      Array.from(new Set(additionalAvailableModelIds).add(selectedModelId))
    );
  };

  return (
    <FieldSection
      fieldName="selectedModelId"
      labelText="Model Selection"
      description="The initial model selected for the chatbot."
      inputType="custom"
      inputNode={
        <>
          <SimpleDropdown
            labelText=""
            onChange={event => {
              setAvailableModelsSetting(
                Array.from(
                  new Set(additionalAvailableModelIds).add(event.target.value)
                )
              );
              setPropertyValue('selectedModelId', event.target.value);
              // updateAvailableModels();
            }}
            items={modelDescriptions.map(model => {
              return {value: model.id, text: model.name};
            })}
            selectedValue={selectedModelId}
            name="model"
            size="s"
          />
          <br />
          <BodyFourText>
            <i>
              Additional models available to the student to select from and
              compare to each other. Note that these are only relevant if
              visibility is Editable. Otherwise, the model selection dropdown
              will be disabled in the level.
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
                    additionalAvailableModelIds.has(model.id) ||
                    model.id === selectedModelId
                  }
                  disabled={model.id === selectedModelId}
                  onChange={e => {
                    if (e.target.checked) {
                      setAdditionalAvailableModelIds(
                        additionalAvailableModelIds.add(e.target.name)
                      );
                      console.log(additionalAvailableModelIds);
                      updateAvailableModels();
                    } else {
                      additionalAvailableModelIds.delete(e.target.name);
                      setAdditionalAvailableModelIds(
                        additionalAvailableModelIds
                      );
                      updateAvailableModels();
                      console.log(additionalAvailableModelIds);
                    }
                  }}
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
