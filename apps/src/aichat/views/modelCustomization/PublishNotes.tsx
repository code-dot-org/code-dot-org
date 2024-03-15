import React from 'react';

import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import {MODEL_CARD_FIELDS_AND_LABELS} from './constants';
import {isVisible, isDisabled} from './utils';
import {setModelCardProperty} from '@cdo/apps/aichat/redux/aichatRedux';
import styles from '../model-customization-workspace.module.scss';

const PublishNotes: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const {modelCardInfo} = useAppSelector(
    state => state.aichat.levelAiCustomizations
  );

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        {MODEL_CARD_FIELDS_AND_LABELS.map(([id, text]) => {
          return (
            isVisible(modelCardInfo.visibility) && (
              <div className={styles.inputContainer} key={id}>
                <label htmlFor={id}>
                  <StrongText>{text}</StrongText>
                </label>
                <textarea
                  id={id}
                  disabled={isDisabled(modelCardInfo.visibility)}
                  value={modelCardInfo.value[id]}
                  onChange={event =>
                    dispatch(
                      setModelCardProperty({
                        property: id,
                        value: event.target.value,
                      })
                    )
                  }
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
