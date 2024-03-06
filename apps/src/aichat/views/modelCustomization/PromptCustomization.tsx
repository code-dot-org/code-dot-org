import React, {useState, ChangeEvent} from 'react';

import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from '../model-customization-workspace.module.scss';

const PromptCustomization: React.FunctionComponent = () => {
  const [temperature, setTemperature] = useState('0.05');

  const handleTemperatureChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTemperature(event.target.value);
  };

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        <div className={styles.inputContainer}>
          <label htmlFor="chatbot-name">
            <StrongText>Chatbot name</StrongText>
          </label>
          <input id="chatbot-name" />
        </div>
        <div className={styles.inputContainer}>
          <div className={styles.horizontalFlexContainer}>
            <label htmlFor="temperature">
              <StrongText>Temperature</StrongText>
            </label>
            {temperature}
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={temperature}
            onChange={handleTemperatureChange}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="system-prompt">
            <StrongText>System prompt</StrongText>
          </label>
          <textarea id="system-prompt" />
        </div>
      </div>
      <div className={styles.footerButtonContainer}>
        <button type="button">Update</button>
      </div>
    </div>
  );
};

export default PromptCustomization;
