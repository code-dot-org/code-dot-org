import Alert, {alertTypes} from '@code-dot-org/component-library/alert';
import React from 'react';

import {
  selectCurrentCustomizationsMatchInitial,
  selectHavePropertiesChanged,
  selectSavedCustomizationsMatchInitial,
} from '@cdo/apps/aichat/redux';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {FAQ_LINK} from '../../constants';
import aichatI18n from '../../locale';

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

  const alerts = {
    error: {
      text:
        saveError?.type === 'permissionsError'
          ? commonI18n.aiChatNotAuthorizedSignedOut()
          : saveError?.message || aichatI18n.saveError(),
      type: alertTypes.danger,
      link:
        saveError?.type === 'permissionsError'
          ? {href: FAQ_LINK, text: commonI18n.learnMore()}
          : undefined,
    },
    reminder: {
      text: aichatI18n.saveChangesReminderAlert(),
      type: alertTypes.info,
    },
    unsaved: {
      text: aichatI18n.saveChangesUnsavedAlert(),
      type: alertTypes.warning,
    },
    saved: {
      text: aichatI18n.saveChangesSucessAlert(),
      type: alertTypes.success,
    },
    reset: {
      text: aichatI18n.modelResetNotification(),
      type: alertTypes.success,
    },
  };

  const showError = !!saveError;
  const showReminder = isCurrentDefault && isSavedDefault;
  const showUnsaved = havePropertiesChanged;
  const showSaved = !isSavedDefault && !havePropertiesChanged;

  const alert = showError
    ? alerts.error
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
