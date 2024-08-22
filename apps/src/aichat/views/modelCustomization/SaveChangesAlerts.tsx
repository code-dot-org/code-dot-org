import React from 'react';
import {useSelector} from 'react-redux';

import {
  selectCurrentEmptyModelCard,
  selectSavedEmptyModelCard,
  selectHavePropertiesChanged,
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
  // const currentSaveType = useAppSelector(state => state.aichat.currentSaveType);
  const havePropertiesChanged = useAppSelector(selectHavePropertiesChanged);
  const isCurrentModelCardEmpty = useAppSelector(selectCurrentEmptyModelCard);
  const isSavedModelCardEmpty = useAppSelector(selectSavedEmptyModelCard);
  return (
    <>
      {havePropertiesChanged && !saveInProgress && !isReadOnly && (
        <Alert
          text={'You have unsaved changes'}
          type={'warning'}
          size="s"
          className={styles.saveAlert}
        />
      )}
      {isCurrentModelCardEmpty &&
        isSavedModelCardEmpty &&
        !saveInProgress &&
        !isReadOnly && (
          <Alert
            text={'Remember to save your changes'}
            type={'info'}
            size="s"
            className={styles.saveAlert}
          />
        )}
      {!isSavedModelCardEmpty &&
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
    </>
  );
};

export default SaveChangesAlerts;
