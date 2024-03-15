import React from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import {setLevelAiCustomizationProperty} from '../../redux/aichatRedux';
import styles from '../model-customization-workspace.module.scss';
import {
  MAX_TEMPERATURE,
  MIN_TEMPERATURE,
  SET_TEMPERATURE_STEP,
} from './constants';
import {isVisible, isDisabled} from './utils';

const PromptCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const {botName, temperature, systemPrompt} = useAppSelector(
    state => state.aichat.levelAiCustomizations
  );

  const allFieldsDisabled =
    isDisabled(botName.visibility) &&
    isDisabled(temperature.visibility) &&
    isDisabled(systemPrompt.visibility);

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
              value={botName.value}
              disabled={isDisabled(botName.visibility)}
              onChange={event =>
                dispatch(
                  setLevelAiCustomizationProperty({
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
              {temperature.value}
            </div>
            <input
              type="range"
              min={MIN_TEMPERATURE}
              max={MAX_TEMPERATURE}
              step={SET_TEMPERATURE_STEP}
              value={temperature.value}
              disabled={isDisabled(temperature.visibility)}
              onChange={event =>
                dispatch(
                  setLevelAiCustomizationProperty({
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
              value={systemPrompt.value}
              disabled={isDisabled(systemPrompt.visibility)}
              onChange={event =>
                dispatch(
                  setLevelAiCustomizationProperty({
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
        <button type="button" disabled={allFieldsDisabled}>
          Update
        </button>
      </div>
    </div>
  );
};

export default PromptCustomization;
