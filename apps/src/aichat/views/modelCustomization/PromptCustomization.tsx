import React from 'react';
import {useSelector} from 'react-redux';

import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from '../model-customization-workspace.module.scss';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';

const DEFAULT_INITIAL_AI_CUSTOMIZATIONS = {
  botName: {value: '', visibility: 'editable'},
  temperature: {value: 0.5, visibility: 'editable'},
  systemPrompt: {value: '', visibility: 'editable'},
};

const PromptCustomization: React.FunctionComponent = () => {
  // deal with AiCustomizations vs LevelAiCustomizations distinction in requiring model
  const {botName, temperature, systemPrompt} = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || DEFAULT_INITIAL_AI_CUSTOMIZATIONS
  );

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        {botName.visibility !== 'hidden' && (
          <div className={styles.inputContainer}>
            <label htmlFor="chatbot-name">
              <StrongText>Chatbot name</StrongText>
            </label>
            <input
              id="chatbot-name"
              value={botName.value}
              disabled={botName.visibility === 'readonly'}
              // readOnly might be preferred?
            />
          </div>
        )}
        {temperature.visibility !== 'hidden' && (
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
              disabled={temperature.visibility === 'readonly'}
            />
          </div>
        )}
        {systemPrompt.visibility !== 'hidden' && (
          <div className={styles.inputContainer}>
            <label htmlFor="system-prompt">
              <StrongText>System prompt</StrongText>
            </label>
            <textarea
              id="system-prompt"
              value={systemPrompt.value}
              disabled={systemPrompt.visibility === 'readonly'}
            />
          </div>
        )}
      </div>
      <div className={styles.footerButtonContainer}>
        <button type="button">Update</button>
      </div>
    </div>
  );
};

export default PromptCustomization;
