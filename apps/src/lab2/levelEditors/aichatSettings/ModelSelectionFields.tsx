import React, {useContext, useState} from 'react';

import {BodyFourText} from '@cdo/apps/componentLibrary/typography';
import Checkbox from '@cdo/apps/componentLibrary/checkbox/Checkbox';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown';

import {modelDescriptions} from '@cdo/apps/aichat/constants';
import moduleStyles from './edit-aichat-settings.module.scss';
import {UpdateContext} from './UpdateContext';
import FieldSection from './FieldSection';
import {Visibility} from '@cdo/apps/aichat/types';

const unionModelIds = (
  additionalIds: Set<string>,
  selectedId: string
): string[] => {
  return Array.from(new Set(additionalIds).add(selectedId));
};

const ModelSelectionFields: React.FunctionComponent = () => {
  const {setModelSelectionValues, aichatSettings} = useContext(UpdateContext);
  const shouldDisableAdditionalModelSelection =
    aichatSettings.visibilities.selectedModelId !== Visibility.EDITABLE;
  const [additionalAvailableModelIds, setAdditionalAvailableModelIds] =
    useState<Set<string>>(
      new Set(
        aichatSettings.availableModelIds.filter(
          id => id !== aichatSettings.initialCustomizations.selectedModelId
        )
      )
    );
  const selectedModelId = aichatSettings.initialCustomizations.selectedModelId;

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
            onChange={e => {
              setModelSelectionValues(
                unionModelIds(additionalAvailableModelIds, e.target.value),
                e.target.value
              );
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
              Models available to the student to select from and compare to each
              other. Note that these are only relevant if visibility is
              Editable. Otherwise, the model selection dropdown will be disabled
              and compare button will be hidden in the level.
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
                  disabled={
                    model.id === selectedModelId ||
                    shouldDisableAdditionalModelSelection
                  }
                  onChange={e => {
                    if (e.target.checked) {
                      setAdditionalAvailableModelIds(
                        additionalAvailableModelIds.add(e.target.name)
                      );
                      setModelSelectionValues(
                        unionModelIds(
                          additionalAvailableModelIds,
                          selectedModelId
                        ),
                        selectedModelId
                      );
                    } else {
                      additionalAvailableModelIds.delete(e.target.name);
                      setAdditionalAvailableModelIds(
                        additionalAvailableModelIds
                      );
                      setModelSelectionValues(
                        unionModelIds(
                          additionalAvailableModelIds,
                          selectedModelId
                        ),
                        selectedModelId
                      );
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
