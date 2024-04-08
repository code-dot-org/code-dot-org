import React, {useCallback} from 'react';

import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {MODEL_CARD_FIELDS_LABELS_ICONS} from './constants';
import {isVisible, isDisabled} from './utils';
import {
  setModelCardProperty,
  updateAiCustomization,
} from '@cdo/apps/aichat/redux/aichatRedux';
import styles from '../model-customization-workspace.module.scss';
import {ModelCardInfo} from '@cdo/apps/aichat/types';
import {get} from 'jquery';

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

  const getPropertyInput = (property: keyof ModelCardInfo) => {
    if (property === 'botName') {
      return (
        <input
          id="chatbot-name"
          value={modelCardInfo[property]}
          disabled={isDisabled(visibility)}
          onChange={event =>
            dispatch(
              setModelCardProperty({
                property: property,
                value: event.target.value,
              })
            )
          }
        />
      );
    }
    return (
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
    );
  };

  return (
    <div className={styles.verticalFlexContainer}>
      {isVisible(visibility) && (
        <div>
          {MODEL_CARD_FIELDS_LABELS_ICONS.map(([property, label]) => {
            return (
              <>
                <div className={styles.inputContainer} key={property}>
                  <label htmlFor={property}>
                    <StrongText>{label}</StrongText>
                  </label>
                </div>
                {getPropertyInput(property)}
              </>
            );
          })}
        </div>
      )}
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
