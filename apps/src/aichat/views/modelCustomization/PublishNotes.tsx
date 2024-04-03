import React, {useCallback} from 'react';

import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {MODEL_CARD_FIELDS_AND_LABELS} from './constants';
import {isVisible, isDisabled} from './utils';
import {
  setModelCardProperty,
  updateAiCustomization,
} from '@cdo/apps/aichat/redux/aichatRedux';
import styles from '../model-customization-workspace.module.scss';

const PublishNotes: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const visibility = useAppSelector(
    state => state.aichat.fieldVisibilities.modelCardInfo
  );
  const {modelCardInfo} = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const onUpdate = useCallback(
    () => dispatch(updateAiCustomization()),
    [dispatch]
  );

  return (
    <div className={styles.verticalFlexContainer}>
      <div>
        {MODEL_CARD_FIELDS_AND_LABELS.map(([id, text]) => {
          return (
            isVisible(visibility) && (
              <div className={styles.inputContainer} key={id}>
                <label htmlFor={id}>
                  <StrongText>{text}</StrongText>
                </label>
                <textarea
                  id={id}
                  disabled={isDisabled(visibility)}
                  value={modelCardInfo[id]}
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
        <Button
          text="Publish"
          iconLeft={{iconName: 'upload'}}
          disabled={isDisabled(visibility)}
          onClick={onUpdate}
          className={styles.updateButton}
        />
      </div>
    </div>
  );
};

export default PublishNotes;
