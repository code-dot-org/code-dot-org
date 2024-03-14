import React from 'react';
import {useSelector} from 'react-redux';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {updateAiCustomizationProperty} from '../../redux/aichatRedux';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';
import styles from '../model-customization-workspace.module.scss';
import {isVisible, isDisabled} from './utils';
import {EMPTY_AI_CUSTOMIZATIONS_WITH_VISIBILITY} from './constants';

const PromptCustomization: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const {botName, temperature, systemPrompt} = useAppSelector(
    state =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS_WITH_VISIBILITY
  );
  const aiCustomizations = useAppSelector(
    state => state.aichat.aiCustomizations
  );
  console.log(aiCustomizations);
  const systemPromptUpdated = aiCustomizations.systemPrompt;

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
              // readOnly might be preferred property for disabling inputs?
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
              min="0"
              max="1"
              step="0.01"
              value={temperature.value}
              disabled={isDisabled(temperature.visibility)}
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
              value={systemPromptUpdated}
              disabled={isDisabled(systemPrompt.visibility)}
              onChange={event =>
                dispatch(
                  updateAiCustomizationProperty({
                    customization: 'systemPrompt',
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
