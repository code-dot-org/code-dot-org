import Alert, {AlertProps} from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback} from 'react';
import {useSelector} from 'react-redux';

import {
  setModelCardProperty,
  saveModelCard,
  publishModelCard,
  selectHasFilledOutModelCard,
  selectHavePropertiesChanged,
} from '@cdo/apps/aichat/redux';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
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
    dispatch(publishModelCard());
  }, [dispatch]);

  const [alertText, type]: [string, AlertProps['type']] = hasFilledOutModelCard
    ? ['Ready to publish', 'success']
    : ['In order to publish, you must fill out a model card', 'warning'];

  return (
    <div
      id="uitest-publish-notes-tab-content"
      className={modelCustomizationStyles.verticalFlexContainer}
    >
      <div className={modelCustomizationStyles.customizationContainer}>
        {!isReadOnly && <Alert text={alertText} type={type} size="s" />}
        {MODEL_CARD_FIELDS_LABELS_ICONS.map(data => {
          const {property, label, editTooltip} = data;
          const InputTag = getInputTag(property);

          if (property === 'exampleTopics') {
            return (
              <ExampleTopicsInputs
                key={property}
                fieldLabel={label}
                fieldId={property}
                tooltipText={editTooltip}
                topics={modelCardInfo.exampleTopics}
                readOnly={isReadOnly}
                visibility={visibility}
              />
            );
          }
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
          );
        })}
      </div>
      <div className={modelCustomizationStyles.footerButtonContainer}>
        <MuiButton
          variant="outlined"
          color="secondary"
          size="medium"
          disabled={isReadOnly || saveInProgress || !havePropertiesChanged}
          className={modelCustomizationStyles.updateButton}
          id="uitest-publish-notes-save"
          onClick={onSave}
          loading={saveInProgress && currentSaveType === 'saveModelCard'}
          loadingPosition="start"
          startIcon={<FontAwesomeV6Icon iconName="download" />}
          type="button"
        >
          {'Save'}
        </MuiButton>
        <MuiButton
          variant="contained"
          color="primary"
          size="medium"
          disabled={isReadOnly || !hasFilledOutModelCard || saveInProgress}
          className={modelCustomizationStyles.updateButton}
          id="uitest-publish-notes-publish"
          onClick={onPublish}
          loading={saveInProgress && currentSaveType === 'publishModelCard'}
          loadingPosition="start"
          startIcon={<FontAwesomeV6Icon iconName="upload" />}
          type="button"
        >
          {'Publish'}
        </MuiButton>
      </div>
      <SaveChangesAlerts isReadOnly={isReadOnly} />
    </div>
  );
};

const getInputTag = (property: keyof ModelCardInfo) => {
  return property === 'botName' ? 'input' : 'textarea';
};

export default PublishNotes;
