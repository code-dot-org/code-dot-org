import React from 'react';
import {useSelector} from 'react-redux';

import {
  selectCurrentCustomizationsMatchInitial,
  selectHavePropertiesChanged,
  selectSavedCustomizationsMatchInitial,
} from '@cdo/apps/aichat/redux/aichatRedux';
import Alert from '@cdo/apps/componentLibrary/alert/Alert';
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

  return (
    <div className={styles.saveAlertContainer}>
      {isCurrentDefault && isSavedDefault && !saveInProgress && !isReadOnly && (
        <Alert
          text={'Remember to save your changes'}
          type={'info'}
          size="s"
          className={styles.saveAlert}
        />
      )}
      {havePropertiesChanged && !saveInProgress && !isReadOnly && (
        <Alert
          text={'You have unsaved changes'}
          type={'warning'}
          size="s"
          className={styles.saveAlert}
        />
      )}
      {!isSavedDefault &&
        !havePropertiesChanged &&
        !saveInProgress &&
        !isReadOnly && (
          <Alert
            text={'Saved'}
            type={'success'}
            size="s"
            className={styles.saveAlert}
          />
        )}
    </div>
  );
};

export default SaveChangesAlerts;
