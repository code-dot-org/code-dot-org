import React, {useCallback, useState, useMemo} from 'react';
import classNames from 'classnames';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import Button from '@cdo/apps/componentLibrary/button/Button';
import SimpleDropdown from '@cdo/apps/componentLibrary/dropdown/simpleDropdown/SimpleDropdown';
import {
  setAiCustomizationProperty,
  updateAiCustomization,
} from '../../redux/aichatRedux';
import styles from '../model-customization-workspace.module.scss';
import {
  DEFAULT_VISIBILITIES,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  SET_TEMPERATURE_STEP,
} from './constants';
import {isVisible, isDisabled, isEditable} from './utils';
import CompareModelsDialog from './CompareModelsDialog';
import {modelDescriptions} from '../../constants';
import {AichatLevelProperties, ModelDescription} from '@cdo/apps/aichat/types';

const SetupCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const [isShowingModelDialog, setIsShowingModelDialog] =
    useState<boolean>(false);

  const {
    temperature,
    systemPrompt,
    selectedModelId = DEFAULT_VISIBILITIES.selectedModelId,
  } = useAppSelector(state => state.aichat.fieldVisibilities);
  const aiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const savedModelIds = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.aichatSettings?.availableModelIds
  );

  // Handle the possibility that modelDescription can change but levels
  // may be using outdated model ids. Fall back to first modelDescription.
  const availableModels = useMemo(() => {
    let models: ModelDescription[] = [];
    if (savedModelIds && savedModelIds.length) {
      // Exclude any models that we don't have descriptions for
      models = modelDescriptions.filter(model =>
        savedModelIds.includes(model.id)
      );
    }
    return models.length ? models : [modelDescriptions[0]];
  }, [savedModelIds]);

  const chosenModelId = useMemo(() => {
    return (
      availableModels.find(
        model => model.id === aiCustomizations.selectedModelId
      )?.id || availableModels[0].id
    );
  }, [aiCustomizations.selectedModelId, availableModels]);

  const allFieldsDisabled =
    isDisabled(temperature) &&
    isDisabled(systemPrompt) &&
    isDisabled(selectedModelId);

  const onUpdate = useCallback(
    () => dispatch(updateAiCustomization()),
    [dispatch]
  );

  const renderChooseAndCompareModels = () => {
    return (
      <div className={styles.inputContainer}>
        <SimpleDropdown
          labelText="Selected model:"
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
          disabled={isDisabled(selectedModelId)}
        />
        {isEditable(selectedModelId) && (
          <Button
            text="Compare Models"
            onClick={() => setIsShowingModelDialog(true)}
            type="secondary"
            className={classNames(
              styles.updateButton,
              styles.compareModelsButton
            )}
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
              <label htmlFor="temperature">
                <StrongText>Temperature</StrongText>
              </label>
              {aiCustomizations.temperature}
            </div>
            <input
              type="range"
              min={MIN_TEMPERATURE}
              max={MAX_TEMPERATURE}
              step={SET_TEMPERATURE_STEP}
              value={aiCustomizations.temperature}
              disabled={isDisabled(temperature)}
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
            <label htmlFor="system-prompt">
              <StrongText>System prompt</StrongText>
            </label>
            <textarea
              id="system-prompt"
              value={aiCustomizations.systemPrompt}
              disabled={isDisabled(systemPrompt)}
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
        <Button
          text="Update"
          disabled={allFieldsDisabled}
          iconLeft={{iconName: 'edit'}}
          onClick={onUpdate}
          className={styles.updateButton}
        />
      </div>
    </div>
  );
};

export default SetupCustomization;
