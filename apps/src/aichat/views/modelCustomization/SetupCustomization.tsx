import React, {useCallback, useState} from 'react';
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
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  SET_TEMPERATURE_STEP,
} from './constants';
import {isVisible, isDisabled} from './utils';
import CompareModelsDialog from './CompareModelsDialog';
import {modelDescriptions} from '../../constants';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';

const SetupCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const [isShowingModelDialog, setIsShowingModelDialog] =
    useState<boolean>(false);

  const {temperature, systemPrompt} = useAppSelector(
    state => state.aichat.fieldVisibilities
  );
  const aiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  /** defaults to all models if not set in levelProperties */
  const availableModelIds = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.aichatSettings?.availableModelIds
  );
  const availableModels = availableModelIds
    ? modelDescriptions.filter(model => availableModelIds.includes(model.id))
    : modelDescriptions;

  const chosenModelId = aiCustomizations.selectedModel || availableModels[0].id;
  const allFieldsDisabled = isDisabled(temperature) && isDisabled(systemPrompt);

  const onUpdate = useCallback(
    () => dispatch(updateAiCustomization()),
    [dispatch]
  );

  const renderChooseAndCompareModels = () => {
    return (
      <div
        className={classNames(
          styles.inputContainer,
          styles.fullWidthDropdownContainer
        )}
      >
        <SimpleDropdown
          labelText="Selected model:"
          onChange={event =>
            dispatch(
              setAiCustomizationProperty({
                property: 'selectedModel',
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
        />
        <Button
          text="Compare Models"
          onClick={() => setIsShowingModelDialog(true)}
          type="secondary"
          className={styles.updateButton}
        />
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
        {renderChooseAndCompareModels()}
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
