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
  EMPTY_AI_CUSTOMIZATIONS,
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  SET_TEMPERATURE_STEP,
} from './constants';
import {isVisible, isDisabled} from './utils';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';
import CompareModelsDialog from './CompareModelsDialog';

const PromptCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const [chosenModel, setChosenModel] = useState<string>('llama2');
  const [isShowingModelDialog, setIsShowingModelDialog] =
    useState<boolean>(false);

  const {botName, temperature, systemPrompt} = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
  );
  const aiCustomizations = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const allFieldsDisabled =
    isDisabled(botName.visibility) &&
    isDisabled(temperature.visibility) &&
    isDisabled(systemPrompt.visibility);

  const onUpdate = useCallback(
    () => dispatch(updateAiCustomization()),
    [dispatch]
  );

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        <div className={classNames(styles.inputContainer)}>
          <SimpleDropdown
            labelText="Pick a model:"
            onChange={e => setChosenModel(e.target.value)}
            items={[
              {value: 'llama2', text: 'LLama 2'},
              {value: 'gpt', text: 'ChatGPT'},
            ]}
            selectedValue={chosenModel}
            name="model"
            size="s"
            className={styles.updateButton}
          />
          <div>
            <Button
              text="Compare Models"
              onClick={() => setIsShowingModelDialog(true)}
              type="secondary"
              className={styles.updateButton}
            />
          </div>
          {isShowingModelDialog && (
            <CompareModelsDialog
              onClose={() => setIsShowingModelDialog(false)}
            />
          )}
        </div>
        {isVisible(botName.visibility) && (
          <div className={styles.inputContainer}>
            <label htmlFor="chatbot-name">
              <StrongText>Chatbot name</StrongText>
            </label>
            <input
              id="chatbot-name"
              value={aiCustomizations.botName}
              disabled={isDisabled(botName.visibility)}
              onChange={event =>
                dispatch(
                  setAiCustomizationProperty({
                    property: 'botName',
                    value: event.target.value,
                  })
                )
              }
            />
          </div>
        )}
        {isVisible(temperature.visibility) && (
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
              disabled={isDisabled(temperature.visibility)}
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
        {isVisible(systemPrompt.visibility) && (
          <div className={styles.inputContainer}>
            <label htmlFor="system-prompt">
              <StrongText>System prompt</StrongText>
            </label>
            <textarea
              id="system-prompt"
              value={aiCustomizations.systemPrompt}
              disabled={isDisabled(systemPrompt.visibility)}
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
          onClick={onUpdate}
          className={styles.updateButton}
        />
      </div>
    </div>
  );
};

export default PromptCustomization;
