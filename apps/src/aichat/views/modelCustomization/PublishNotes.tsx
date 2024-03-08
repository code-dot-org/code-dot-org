import React from 'react';
import {useSelector} from 'react-redux';

import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from '../model-customization-workspace.module.scss';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';

const INPUTS = [
  {id: 'description', text: 'Description'},
  {id: 'intendedUse', text: 'Intended Use'},
  {id: 'limitationsAndWarnings', text: 'Limitations and Warnings'},
  {id: 'testingAndEvaluation', text: 'Testing and Evaluation'},
];

// what does it mean for this to be hidden? hide whole tab?
const PublishNotes: React.FunctionComponent = () => {
  // deal with AiCustomizations vs LevelAiCustomizations distinction in requiring model
  const {modelCardInfo} = useSelector(
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
          value: {
            description: 'a description',
            intendedUse: 'intended use',
            limitationsAndWarnings: 'limitations and warnings',
            testingAndEvaluation: 'testing and evaluation',
            askAboutTopics: 'ask about topics',
          },
          visibility: 'editable',
        },
      }
  );

  console.log(modelCardInfo);

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        {INPUTS.map(input => {
          return (
            modelCardInfo.visibility !== 'hidden' && (
              <div className={styles.inputContainer} key={input.id}>
                <label htmlFor={input.id}>
                  <StrongText>{input.text}</StrongText>
                </label>
                <textarea
                  id={input.id}
                  disabled={modelCardInfo.visibility === 'readonly'}
                  value={modelCardInfo.value[input.id]}
                />
              </div>
            )
          );
        })}
      </div>
      <div className={styles.footerButtonContainer}>
        <button type="button">Publish</button>
      </div>
    </div>
  );
};

export default PublishNotes;
