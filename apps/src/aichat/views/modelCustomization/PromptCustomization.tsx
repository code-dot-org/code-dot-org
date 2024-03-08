import React, {useState, ChangeEvent} from 'react';
import {useSelector} from 'react-redux';

import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from '../model-customization-workspace.module.scss';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {AichatLevelProperties, AiCustomizations} from '@cdo/apps/aichat/types';

interface PromptCustomizationProps {
  botName: string;
}

const PromptCustomization: React.FunctionComponent<
  PromptCustomizationProps
> = ({botName}) => {
  const [temperature, setTemperature] = useState('0.05');

  // deal with AiCustomizations vs LevelAiCustomizations distinction in requiring model
  const initialAiCustomizations = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || {
        botName: {value: 'bot name', visibility: 'editable'},
        temperature: {value: 0.5, visibility: 'editable'},
        systemPrompt: {value: 'a system prompt', visibility: 'editable'},
        retrievalContexts: {
          value: ['retrieval 1', 'retrieval 2'],
          visibility: 'editable',
        },
        modelCardInfo: {
          description: 'a description',
          intendedUse: 'intended use',
          limitationsAndWarnings: 'limitations and warnings',
          testingAndEvaluation: 'testing and evaluation',
          askAboutTopics: 'ask about topics',
          visibility: 'editable',
        },
      }
  );

  const getVisibility = (property: keyof AiCustomizations) =>
    initialAiCustomizations[property]?.visibility;
  const isDisabled = (property: keyof AiCustomizations) =>
    getVisibility(property) === 'readonly';
  const isVisible = (property: keyof AiCustomizations) =>
    getVisibility(property) && getVisibility(property) !== 'hidden';

  console.log(isDisabled('temperature'));
  const handleTemperatureChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTemperature(event.target.value);
  };

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        {isVisible('botName') && (
          <div className={styles.inputContainer}>
            <label htmlFor="chatbot-name">
              <StrongText>Chatbot name</StrongText>
            </label>
            <input
              id="chatbot-name"
              value={botName}
              disabled={isDisabled('botName')}
              // readOnly might be preferred?
            />
          </div>
        )}
        {isVisible('temperature') && (
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
              disabled={isDisabled('temperature')}
            />
          </div>
        )}
        {isVisible('systemPrompt') && (
          <div className={styles.inputContainer}>
            <label htmlFor="system-prompt">
              <StrongText>System prompt</StrongText>
            </label>
            <textarea
              id="system-prompt"
              disabled={isDisabled('systemPrompt')}
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
