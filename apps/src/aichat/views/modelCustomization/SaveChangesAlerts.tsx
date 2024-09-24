import React from 'react';

import {
  selectCurrentCustomizationsMatchInitial,
  selectHavePropertiesChanged,
  selectSavedCustomizationsMatchInitial,
} from '@cdo/apps/aichat/redux/aichatRedux';
import Alert, {alertTypes} from '@cdo/apps/componentLibrary/alert/Alert';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

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

  const alerts = {
    reminder: {text: 'Remember to save your changes', type: alertTypes.info},
    unsaved: {
      text: 'You have unsaved changes',
      type: alertTypes.warning,
    },
    saved: {text: 'Saved', type: alertTypes.success},
  };

  const showReminder = isCurrentDefault && isSavedDefault;
  const showUnsaved = havePropertiesChanged;
  const showSaved = !isSavedDefault && !havePropertiesChanged;

  const alert = showReminder
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
          text={alert.text}
          type={alert.type}
          size="s"
          className={styles.saveAlert}
        />
      )}
    </div>
  ) : null;
};

export default SaveChangesAlerts;
