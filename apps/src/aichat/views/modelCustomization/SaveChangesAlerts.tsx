import React from 'react';
import {useSelector} from 'react-redux';

import {
  selectCurrentCustomizationsMatchInitial,
  selectHavePropertiesChanged,
  selectSavedCustomizationsMatchInitial,
} from '@cdo/apps/aichat/redux/aichatRedux';
import Alert, {alertTypes} from '@cdo/apps/componentLibrary/alert/Alert';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {isDisabled} from './utils';

import styles from '../model-customization-workspace.module.scss';

const SaveChangesAlerts: React.FunctionComponent = () => {
  const visibility = useAppSelector(
    state => state.aichat.fieldVisibilities.modelCardInfo
  );
  const isReadOnly = useSelector(isReadOnlyWorkspace) || isDisabled(visibility);
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
