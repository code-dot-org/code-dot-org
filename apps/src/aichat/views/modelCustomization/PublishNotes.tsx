import React, {useCallback} from 'react';
import classNames from 'classnames';

import {
  setModelCardProperty,
  saveModelCard,
  publishModel,
  selectHasFilledOutModelCard,
} from '@cdo/apps/aichat/redux/aichatRedux';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import Button from '@cdo/apps/componentLibrary/button/Button';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS, PLATFORMS} from '@cdo/apps/lib/util/AnalyticsConstants';
import {ANALYTICS_SAMPLE_RATE} from '@cdo/apps/aichat/constants';
import {isSampling} from '@cdo/apps/lib/util/analyticsUtils';

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
  const hasFilledOutModelCard = useAppSelector(selectHasFilledOutModelCard);

  const onSave = useCallback(() => {
    dispatch(saveModelCard());
    if (isSampling(ANALYTICS_SAMPLE_RATE)) {
      analyticsReporter.sendEvent(
        EVENTS.UPDATE_MODEL_CARD_INFO,
        {
          action: 'User clicks on save button',
        },
        PLATFORMS.BOTH
      );
    }
  }, [dispatch]);

  const onPublish = useCallback(() => {
    dispatch(publishModel());
    if (isSampling(ANALYTICS_SAMPLE_RATE)) {
      analyticsReporter.sendEvent(
        EVENTS.UPDATE_MODEL_CARD_INFO,
        {
          action: 'User clicks on publish button',
        },
        PLATFORMS.BOTH
      );
    }
  }, [dispatch]);

  return (
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div>
        {!isDisabled(visibility)
          ? hasFilledOutModelCard
            ? PublishOkNotification
            : CompleteToPublishNotification
          : null}
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
                {property !== 'exampleTopics' && property !== 'isPublished' && (
                  <InputTag
                    id={property}
                    type="text"
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
          disabled={isDisabled(visibility) || !hasFilledOutModelCard}
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

const PublishOkNotification = (
  <PublishStatus
    iconName="check"
    iconStyle={moduleStyles.check}
    content="Ready to publish"
    contentStyle={moduleStyles.messageTextContainer}
    containerStyle={moduleStyles.messageContainerPublishOk}
  />
);

const CompleteToPublishNotification = (
  <PublishStatus
    iconName="triangle-exclamation"
    iconStyle={moduleStyles.alert}
    content={
      <>
        In order to publish, you <StrongText>must</StrongText> fill out a model
        card
      </>
    }
    contentStyle={moduleStyles.messageTextContainer}
    containerStyle={classNames(moduleStyles.messageContainerAlert)}
  />
);

export default PublishNotes;
