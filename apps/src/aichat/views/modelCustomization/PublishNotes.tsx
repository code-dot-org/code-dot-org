import React, {useCallback} from 'react';
import classNames from 'classnames';

import {
  setModelCardProperty,
  updateAiCustomization,
} from '@cdo/apps/aichat/redux/aichatRedux';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import Button from '@cdo/apps/componentLibrary/button/Button';

import {MODEL_CARD_FIELDS_LABELS_ICONS} from './constants';
import {isDisabled} from './utils';
import ExampleTopicsInputs from './ExampleTopicsInputs';
import PublishStatus from './PublishStatus';
import moduleStyles from './publish-notes.module.scss';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';
import {ModelCardInfo} from '../../types';

const PublishNotes: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const visibility = useAppSelector(
    state => state.aichat.fieldVisibilities.modelCardInfo
  );
  const {modelCardInfo} = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );

  const onSave = useCallback(
    () => dispatch(updateAiCustomization()),
    [dispatch]
  );

  const onPublish = useCallback(
    () => dispatch(updateAiCustomization()),
    [dispatch]
  );

  return (
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        {hasFilledOutModelCard(modelCardInfo)
          ? renderPublishOkNotification()
          : renderCompleteToPublishNotification()}
        <div className={modelCustomizationStyles.customizationContainer}>
          {MODEL_CARD_FIELDS_LABELS_ICONS.map(([property, label, _]) => {
            const InputTag = getInputTag(property);

            return (
              <div
                className={modelCustomizationStyles.inputContainer}
                key={property}
              >
                <label htmlFor={property}>
                  <StrongText>{label}</StrongText>
                </label>
                {property === 'exampleTopics' && (
                  <ExampleTopicsInputs
                    topics={modelCardInfo.exampleTopics}
                    readOnly={isDisabled(visibility)}
                  />
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
      </div>
      <div className={modelCustomizationStyles.footerButtonContainer}>
        <Button
          text="Save"
          iconLeft={{iconName: 'download'}}
          type="secondary"
          color="black"
          disabled={isDisabled(visibility)}
          onClick={onSave}
          className={modelCustomizationStyles.updateButton}
        />
        <Button
          text="Publish"
          iconLeft={{iconName: 'upload'}}
          disabled={
            isDisabled(visibility) || !hasFilledOutModelCard(modelCardInfo)
          }
          onClick={onPublish}
          className={modelCustomizationStyles.updateButton}
        />
      </div>
    </div>
  );
};

const getInputTag = (property: keyof ModelCardInfo) => {
  return property === 'botName' ? 'input' : 'textarea';
};

const hasFilledOutModelCard = (modelCardInfo: ModelCardInfo) => {
  for (const key of Object.keys(modelCardInfo)) {
    const typedKey = key as keyof ModelCardInfo;

    if (typedKey === 'exampleTopics') {
      if (
        !modelCardInfo['exampleTopics'].filter(topic => topic.length).length
      ) {
        return false;
      }
    } else if (!modelCardInfo[typedKey].length) {
      return false;
    }
  }

  return true;
};

const renderPublishOkNotification = () => {
  return (
    <PublishStatus
      iconName="check"
      iconStyle={moduleStyles.check}
      content="Ready to publish"
      contentStyle={moduleStyles.messageTextContainer}
      containerStyle={moduleStyles.messageContainerPublishOk}
    />
  );
};

const renderCompleteToPublishNotification = () => {
  return (
    <PublishStatus
      iconName="triangle-exclamation"
      iconStyle={moduleStyles.alert}
      content={
        <>
          In order to publish, you <StrongText>must</StrongText> fill out a
          model card
        </>
      }
      contentStyle={moduleStyles.messageTextContainer}
      containerStyle={classNames(moduleStyles.messageContainerAlert)}
    />
  );
};

export default PublishNotes;
