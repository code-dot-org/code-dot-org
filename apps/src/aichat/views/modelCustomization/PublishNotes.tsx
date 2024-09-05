import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import {
  setModelCardProperty,
  saveModelCard,
  publishModel,
  selectHasFilledOutModelCard,
  selectHavePropertiesChanged,
} from '@cdo/apps/aichat/redux/aichatRedux';
import Alert, {AlertProps} from '@cdo/apps/componentLibrary/alert/Alert';
import Button from '@cdo/apps/componentLibrary/button/Button';
import {FontAwesomeV6IconProps} from '@cdo/apps/componentLibrary/fontAwesomeV6Icon';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useAppSelector, useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {ModelCardInfo} from '../../types';

import {MODEL_CARD_FIELDS_LABELS_ICONS} from './constants';
import ExampleTopicsInputs from './ExampleTopicsInputs';
import FieldLabel from './FieldLabel';
import SaveChangesAlerts from './SaveChangesAlerts';
import {isDisabled} from './utils';

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

  const [alertText, type]: [string, AlertProps['type']] = hasFilledOutModelCard
    ? ['Ready to publish', 'success']
    : ['In order to publish, you must fill out a model card', 'warning'];

  return (
    <div className={modelCustomizationStyles.verticalFlexContainer}>
      <div className={modelCustomizationStyles.customizationContainer}>
        {!isReadOnly && <Alert text={alertText} type={type} size="s" />}
        {MODEL_CARD_FIELDS_LABELS_ICONS.map(data => {
          const {property, label, editTooltip} = data;
          const InputTag = getInputTag(property);

          return (
            <>
              {property === 'exampleTopics' && (
                <ExampleTopicsInputs
                  fieldLabel={label}
                  fieldId={property}
                  tooltipText={editTooltip}
                  topics={modelCardInfo.exampleTopics}
                  readOnly={isReadOnly}
                  visibility={visibility}
                />
              )}
              {property !== 'exampleTopics' && (
                <div
                  className={modelCustomizationStyles.inputContainer}
                  key={property}
                >
                  <FieldLabel
                    label={label}
                    id={property}
                    tooltipText={editTooltip}
                  />
                  {property !== 'isPublished' && (
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
              )}
            </>
          );
        })}
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
      <SaveChangesAlerts />
    </div>
  );
};

const getInputTag = (property: keyof ModelCardInfo) => {
  return property === 'botName' ? 'input' : 'textarea';
};

export default PublishNotes;
