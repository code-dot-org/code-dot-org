import classNames from 'classnames';
import React, {useState, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {AichatLevelProperties, ModelDescription} from '@cdo/apps/aichat/types';
import Button from '@cdo/apps/componentLibrary/button/Button';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown/SimpleDropdown';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {modelDescriptions} from '../../constants';
import {setAiCustomizationProperty} from '../../redux/aichatRedux';

import CompareModelsDialog from './CompareModelsDialog';
import {
  DEFAULT_VISIBILITIES,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  SET_TEMPERATURE_STEP,
} from './constants';
import FieldLabel from './FieldLabel';
import UpdateButton from './UpdateButton';
import {isVisible, isDisabled, isEditable} from './utils';

import styles from '../model-customization-workspace.module.scss';

const SetupCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const [isShowingModelDialog, setIsShowingModelDialog] =
    useState<boolean>(false);

  // we default selectedModelId because it was added later and may not exist in all levels
  const {
    temperature,
    systemPrompt,
    selectedModelId = DEFAULT_VISIBILITIES.selectedModelId,
  } = useAppSelector(state => state.aichat.fieldVisibilities);
  const aiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const availableModelIds = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.aichatSettings?.availableModelIds
  );

  // Handle the possibility that modelDescription can change but levels
  // may be using outdated model ids. Fall back to first modelDescription.
  const availableModels = useMemo(() => {
    let models: ModelDescription[] = [];
    if (availableModelIds && availableModelIds.length) {
      // Exclude any models that we don't have descriptions for
      models = modelDescriptions.filter(model =>
        availableModelIds.includes(model.id)
      );
    }
    return models.length ? models : [modelDescriptions[0]];
  }, [availableModelIds]);

  const chosenModelId = useMemo(() => {
    return (
      availableModels.find(
        model => model.id === aiCustomizations.selectedModelId
      )?.id || availableModels[0].id
    );
  }, [aiCustomizations.selectedModelId, availableModels]);

  const readOnlyWorkspace: boolean = useSelector(isReadOnlyWorkspace);

  const allFieldsDisabled =
    (isDisabled(temperature) &&
      isDisabled(systemPrompt) &&
      isDisabled(selectedModelId)) ||
    readOnlyWorkspace;

  const renderChooseAndCompareModels = () => {
    return (
      <div className={styles.inputContainer}>
        <FieldLabel
          id="selected-model"
          label="Selected model"
          tooltipText="This is the underlying language model being used by the chatbot. Use the dropdown to select from additional fine-tuned models."
        />
        <SimpleDropdown
          labelText="Selected model"
          isLabelVisible={false}
          onChange={event =>
            dispatch(
              setAiCustomizationProperty({
                property: 'selectedModelId',
                value: event.target.value,
              })
            )
          }
          items={availableModels.map(model => {
            return {value: model.id, text: model.name};
          })}
          selectedValue={chosenModelId}
          name="model"
          size="s"
          className={styles.selectedModelDropdown}
          disabled={isDisabled(selectedModelId) || readOnlyWorkspace}
        />
        {isEditable(selectedModelId) && (
          <Button
            text="Compare Models"
            onClick={() => setIsShowingModelDialog(true)}
            type="secondary"
            color="gray"
            className={classNames(
              styles.updateButton,
              styles.compareModelsButton
            )}
            disabled={readOnlyWorkspace}
          />
        )}
        {isShowingModelDialog && (
          <CompareModelsDialog
            onClose={() => setIsShowingModelDialog(false)}
            availableModels={availableModels}
          />
        )}
      </div>
    );
  };

  return (
    <div className={styles.verticalFlexContainer}>
      <div className={styles.customizationContainer}>
        {isVisible(selectedModelId) && renderChooseAndCompareModels()}
        {isVisible(temperature) && (
          <div className={styles.inputContainer}>
            <div className={styles.horizontalFlexContainer}>
              <FieldLabel
                id="temperature"
                label="Temperature"
                tooltipText="Temperature affects which words are generated as a response. Use the slider to change the temperature."
              />
              {aiCustomizations.temperature}
            </div>
            <input
              type="range"
              min={MIN_TEMPERATURE}
              max={MAX_TEMPERATURE}
              step={SET_TEMPERATURE_STEP}
              value={aiCustomizations.temperature}
              disabled={isDisabled(temperature) || readOnlyWorkspace}
              onChange={event =>
                dispatch(
                  setAiCustomizationProperty({
                    property: 'temperature',
                    value: event.target.value,
                  })
                )
              }
            />
          </div>
        )}
        {isVisible(systemPrompt) && (
          <div className={styles.inputContainer}>
            <FieldLabel
              id="system-prompt"
              label="System Prompt"
              tooltipText="The system prompt controls how the chatbot behaves. Type your instructions into the text box."
            />
            <textarea
              id="system-prompt"
              value={aiCustomizations.systemPrompt}
              disabled={isDisabled(systemPrompt) || readOnlyWorkspace}
              onChange={event =>
                dispatch(
                  setAiCustomizationProperty({
                    property: 'systemPrompt',
                    value: event.target.value,
                  })
                )
              }
            />
          </div>
        )}
      </div>
      <div className={styles.footerButtonContainer}>
        <UpdateButton isDisabledDefault={allFieldsDisabled} />
      </div>
    </div>
  );
};

export default SetupCustomization;
