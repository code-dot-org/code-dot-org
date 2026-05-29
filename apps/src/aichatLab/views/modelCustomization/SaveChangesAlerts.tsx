import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React from 'react';

import {modelDescriptions} from '@cdo/apps/aichat/constants';
import {
  selectCurrentCustomizationsMatchInitial,
  selectHavePropertiesChanged,
  selectSavedCustomizationsMatchInitial,
} from '@cdo/apps/aichatLab/redux';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import styles from '../model-customization-workspace.module.scss';

const FAQ_LINK =
  'https://support.code.org/hc/en-us/articles/30162711193741-AI-Chat-Lab-FAQ';

const SaveChangesAlerts: React.FunctionComponent<{isReadOnly: boolean}> = ({
  isReadOnly,
}) => {
  const saveInProgress = useAppSelector(
    state => state.aichatLab.saveInProgress
  );
  const havePropertiesChanged = useAppSelector(selectHavePropertiesChanged);
  const isCurrentDefault = useAppSelector(
    selectCurrentCustomizationsMatchInitial
  );
  const isSavedDefault = useAppSelector(selectSavedCustomizationsMatchInitial);
  const saveError = useAppSelector(state => state.aichatLab.saveError);
  const showResetMessage = useAppSelector(
    state => state.aichatLab.showResetMessage
  );
  const showUnsupportedModelMessage = useAppSelector(
    state => state.aichatLab.showUnsupportedModelMessage
  );
  const currentModelName = useAppSelector(
    state =>
      modelDescriptions.find(
        ({id}) => id === state.aichatLab.currentAiCustomizations.selectedModelId
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
