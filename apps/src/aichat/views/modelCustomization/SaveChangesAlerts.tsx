import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React from 'react';

import {
  selectCurrentCustomizationsMatchInitial,
  selectHavePropertiesChanged,
  selectSavedCustomizationsMatchInitial,
} from '@cdo/apps/aichat/redux';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {FAQ_LINK, modelDescriptions} from '../../constants';

import styles from '../model-customization-workspace.module.scss';

const SaveChangesAlerts: React.FunctionComponent<{isReadOnly: boolean}> = ({
  isReadOnly,
}) => {
  const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);
  const havePropertiesChanged = useAppSelector(selectHavePropertiesChanged);
  const isCurrentDefault = useAppSelector(
    selectCurrentCustomizationsMatchInitial
  );
  const isSavedDefault = useAppSelector(selectSavedCustomizationsMatchInitial);
  const saveError = useAppSelector(state => state.aichat.saveError);
  const showResetMessage = useAppSelector(
    state => state.aichat.showResetMessage
  );
  const showUnsupportedModelMessage = useAppSelector(
    state => state.aichat.showUnsupportedModelMessage
  );
  const currentModelName = useAppSelector(
    state =>
      modelDescriptions.find(
        ({id}) => id === state.aichat.currentAiCustomizations.selectedModelId
      )?.name
  );

  const alerts = {
    error: {
      text:
        saveError?.type === 'permissionsError'
          ? commonI18n.aiChatNotAuthorizedSignedOut()
          : saveError?.message ||
            'There was an error saving your project. Please try again.',
      type: alertTypes.danger,
      link:
        saveError?.type === 'permissionsError'
          ? {href: FAQ_LINK, text: commonI18n.learnMore()}
          : undefined,
    },
    reminder: {
      text: 'Remember to save your changes',
      type: alertTypes.info,
    },
    unsaved: {
      text: 'You have unsaved changes',
      type: alertTypes.warning,
    },
    saved: {
      text: 'Saved',
      type: alertTypes.success,
    },
    reset: {
      text: 'Model customizations and model card information have been reset to default settings.',
      type: alertTypes.success,
    },
    unsupportedModel: {
      text: `Your previously selected model is no longer available. ${
        currentModelName && `We've switched you to ${currentModelName}.`
      }`,
      type: alertTypes.warning,
    },
  };

  const showError = !!saveError;
  const showReminder = isCurrentDefault && isSavedDefault;
  const showUnsaved = havePropertiesChanged;
  const showSaved = !isSavedDefault && !havePropertiesChanged;

  const alert = showError
    ? alerts.error
    : showUnsupportedModelMessage
    ? alerts.unsupportedModel
    : showResetMessage
    ? alerts.reset
    : showReminder
    ? alerts.reminder
    : showUnsaved
    ? alerts.unsaved
    : showSaved
    ? alerts.saved
    : null;

  return !isReadOnly ? (
    <div className={styles.saveAlertContainer}>
      {alert && !saveInProgress && (
        <Alert
          id="uitest-aichat-save-alert"
          {...alert}
          size="s"
          className={styles.saveAlert}
        />
      )}
    </div>
  ) : null;
};

export default SaveChangesAlerts;
