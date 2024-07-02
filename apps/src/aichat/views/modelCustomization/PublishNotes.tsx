import classNames from 'classnames';
import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import {
  setModelCardProperty,
  saveModelCard,
  publishModel,
  selectHasFilledOutModelCard,
  selectHavePropertiesChanged,
} from '@cdo/apps/aichat/redux/aichatRedux';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {StrongText} from '@cdo/apps/componentLibrary/typography/TypographyElements';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {ModelCardInfo} from '../../types';

import {MODEL_CARD_FIELDS_LABELS_ICONS} from './constants';
import ExampleTopicsInputs from './ExampleTopicsInputs';
import FieldLabel from './FieldLabel';
import PublishStatus from './PublishStatus';
import {isDisabled} from './utils';

import moduleStyles from './publish-notes.module.scss';
import modelCustomizationStyles from '../model-customization-workspace.module.scss';

const PublishNotes: React.FunctionComponent = () => {
  const dispatch = useAppDispatch();

  const visibility = useAppSelector(
    state => state.aichat.fieldVisibilities.modelCardInfo
  );
  const {modelCardInfo} = useAppSelector(
    state => state.aichat.currentAiCustomizations
  );
  const hasFilledOutModelCard = useAppSelector(selectHasFilledOutModelCard);

  const isReadOnly = useSelector(isReadOnlyWorkspace) || isDisabled(visibility);
  const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);
  const currentSaveType = useAppSelector(state => state.aichat.currentSaveType);
  const havePropertiesChanged = useAppSelector(selectHavePropertiesChanged);

  const onSave = useCallback(() => {
    dispatch(saveModelCard());
  }, [dispatch]);

  const onPublish = useCallback(() => {
    dispatch(publishModel());
  }, [dispatch]);

  const spinnerIconProps: FontAwesomeV6IconProps = {
    iconName: 'spinner',
    animationType: 'spin',
  };

  return (
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div>
        {!isReadOnly
          ? hasFilledOutModelCard
            ? PublishOkNotification
            : CompleteToPublishNotification
          : null}
        <div className={modelCustomizationStyles.customizationContainer}>
          {MODEL_CARD_FIELDS_LABELS_ICONS.map(
            ([property, label, _, editTooltip]) => {
              const InputTag = getInputTag(property);

              return (
                <div
                  className={modelCustomizationStyles.inputContainer}
                  key={property}
                >
                  <FieldLabel
                    label={label}
                    id={property}
                    tooltipText={editTooltip}
                  />
                  {property === 'exampleTopics' && (
                    <ExampleTopicsInputs
                      topics={modelCardInfo.exampleTopics}
                      readOnly={isReadOnly}
                    />
                  )}
                  {property !== 'exampleTopics' &&
                    property !== 'isPublished' && (
                      <InputTag
                        id={property}
                        type="text"
                        disabled={isReadOnly}
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
            }
          )}
        </div>
      </div>
      <div className={modelCustomizationStyles.footerButtonContainer}>
        <Button
          text="Save"
          iconLeft={
            saveInProgress && currentSaveType === 'saveModelCard'
              ? spinnerIconProps
              : {iconName: 'download'}
          }
          type="secondary"
          color="black"
          disabled={isReadOnly || saveInProgress || !havePropertiesChanged}
          onClick={onSave}
          className={modelCustomizationStyles.updateButton}
        />
        <Button
          text="Publish"
          iconLeft={
            saveInProgress && currentSaveType === 'publishModelCard'
              ? spinnerIconProps
              : {iconName: 'upload'}
          }
          disabled={isReadOnly || !hasFilledOutModelCard || saveInProgress}
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
