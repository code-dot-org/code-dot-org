import React from 'react';
import {useSelector} from 'react-redux';

import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import styles from '../model-customization-workspace.module.scss';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
import {AichatLevelProperties} from '@cdo/apps/aichat/types';
import {
  EMPTY_AI_CUSTOMIZATIONS,
  MODEL_CARD_FIELDS_AND_LABELS,
} from './constants';
import {isHidden, isDisabled} from './utils';

const PublishNotes: React.FunctionComponent = () => {
  const {modelCardInfo} = useSelector(
    (state: {lab: LabState}) =>
      (state.lab.levelProperties as AichatLevelProperties | undefined)
        ?.initialAiCustomizations || EMPTY_AI_CUSTOMIZATIONS
  );

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        {MODEL_CARD_FIELDS_AND_LABELS.map(([id, text]) => {
          return (
            !isHidden(modelCardInfo.visibility) && (
              <div className={styles.inputContainer} key={id}>
                <label htmlFor={id}>
                  <StrongText>{text}</StrongText>
                </label>
                <textarea
                  id={id}
                  disabled={isDisabled(modelCardInfo.visibility)}
                  value={modelCardInfo.value[id]}
                />
              </div>
            )
          );
        })}
      </div>
      <div className={styles.footerButtonContainer}>
        <button type="button" disabled={isDisabled(modelCardInfo.visibility)}>
          Publish
        </button>
      </div>
    </div>
  );
};

export default PublishNotes;
