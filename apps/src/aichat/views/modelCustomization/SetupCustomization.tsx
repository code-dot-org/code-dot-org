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

const SetupCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const [chosenModel, setChosenModel] = useState<string>('llama2');
  const [isShowingModelDialog, setIsShowingModelDialog] =
    useState<boolean>(false);

  const {temperature, systemPrompt} = useAppSelector(
    state => state.aichat.fieldVisibilities
  );
  const aiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

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
          onChange={e => setChosenModel(e.target.value)}
          items={[
            {value: 'llama2', text: 'LLama 2'},
            {value: 'gpt', text: 'ChatGPT'},
          ]}
          selectedValue={chosenModel}
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
          <CompareModelsDialog onClose={() => setIsShowingModelDialog(false)} />
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
