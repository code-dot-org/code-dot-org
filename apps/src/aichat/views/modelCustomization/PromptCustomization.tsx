import React, {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import Button from '@cdo/apps/componentLibrary/button/Button';
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

const PromptCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

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
