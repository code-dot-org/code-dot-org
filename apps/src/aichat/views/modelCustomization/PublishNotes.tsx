import React, {useCallback} from 'react';

import {
  setModelCardProperty,
  updateAiCustomization,
} from '@cdo/apps/aichat/redux/aichatRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {MODEL_CARD_FIELDS_LABELS_ICONS} from './constants';
import {isVisible, isDisabled} from './utils';

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
        {MODEL_CARD_FIELDS_LABELS_ICONS.map(([property, label]) => {
          return (
            isVisible(visibility) && (
              <div className={styles.inputContainer} key={property}>
                <label htmlFor={property}>
                  <StrongText>{label}</StrongText>
                </label>
                <textarea
                  id={property}
                  disabled={isDisabled(visibility)}
                  value={modelCardInfo[property]}
                  onChange={event =>
                    dispatch(
                      setModelCardProperty({
                        property: property,
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
