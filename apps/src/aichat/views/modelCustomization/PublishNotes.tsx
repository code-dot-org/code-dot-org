import React, {useCallback} from 'react';
import {AnyAction, ThunkDispatch} from '@reduxjs/toolkit';

import {
  setModelCardProperty,
  updateAiCustomization,
} from '@cdo/apps/aichat/redux/aichatRedux';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import Button from '@cdo/apps/componentLibrary/button/Button';
import MultiItemInput from '@cdo/apps/lab2/levelEditors/aichatSettings/MultiItemInput';

import {MODEL_CARD_FIELDS_LABELS_ICONS} from './constants';
import {isVisible, isDisabled} from './utils';
import styles from '../model-customization-workspace.module.scss';
import {ModelCardInfo} from '@cdo/apps/aichat/types';

const renderExampleTopicsInputs = (
  topics: string[],
  dispatch: ThunkDispatch<unknown, unknown, AnyAction>,
  readOnly: boolean
) => {
  return (
    <MultiItemInput
      key="exampleTopics"
      items={topics}
      onAdd={() =>
        dispatch(
          setModelCardProperty({
            property: 'exampleTopics',
            value: [...topics].concat(''),
          })
        )
      }
      onRemove={() => {
        dispatch(
          setModelCardProperty({
            property: 'exampleTopics',
            value: [...topics].slice(0, -1),
          })
        );
      }}
      onChange={(index, value) => {
        const updatedTopics = topics.slice();
        updatedTopics[index] = value;
        dispatch(
          setModelCardProperty({
            property: 'exampleTopics',
            value: updatedTopics,
          })
        );
      }}
      readOnly={readOnly}
    />
  );
};

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

  const getInputTag = (property: keyof ModelCardInfo) => {
    return property === 'botName' ? 'input' : 'textarea';
  };

  return (
    <div className={styles.verticalFlexContainer}>
      {isVisible(visibility) && (
        <div className={styles.customizationContainer}>
          {MODEL_CARD_FIELDS_LABELS_ICONS.map(([property, label, _]) => {
            const InputTag = getInputTag(property);

            return (
              <div className={styles.inputContainer} key={property}>
                <label htmlFor={property}>
                  <StrongText>{label}</StrongText>
                </label>
                {property === 'exampleTopics' &&
                  renderExampleTopicsInputs(
                    modelCardInfo.exampleTopics,
                    dispatch,
                    isDisabled(visibility)
                  )}
                {property !== 'exampleTopics' && (
                  <InputTag
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
                )}
              </div>
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
