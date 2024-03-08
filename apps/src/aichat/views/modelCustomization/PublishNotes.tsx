import React from 'react';
import {useSelector} from 'react-redux';

import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from '../model-customization-workspace.module.scss';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {AichatLevelProperties, ModelCardInfo} from '@cdo/apps/aichat/types';
import {DEFAULT_MODEL_CARD_INFO} from './constants';

const INPUTS: {id: keyof ModelCardInfo; text: string}[] = [
  {id: 'description', text: 'Description'},
  {id: 'intendedUse', text: 'Intended Use'},
  {id: 'limitationsAndWarnings', text: 'Limitations and Warnings'},
  {id: 'testingAndEvaluation', text: 'Testing and Evaluation'},
];

const PublishNotes: React.FunctionComponent = () => {
  const modelCardInfo = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations?.modelCardInfo || DEFAULT_MODEL_CARD_INFO
  );

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
        <button
          type="button"
          disabled={modelCardInfo.visibility === 'readonly'}
        >
          Publish
        </button>
      </div>
    </div>
  );
};

export default PublishNotes;
