import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {selectHavePropertiesChanged, updateAiCustomization} from '../../redux';

import styles from '../model-customization-workspace.module.scss';

interface UpdateButtonProps {
  isDisabledDefault: boolean;
}

const UpdateButton: React.FunctionComponent<UpdateButtonProps> = ({
  isDisabledDefault,
}) => {
  const dispatch = useAppDispatch();
  const onUpdate = useCallback(
    () => dispatch(updateAiCustomization()),
    [dispatch]
  );
  const saveInProgress = useAppSelector(state => state.aichat.saveInProgress);
  const currentSaveType = useAppSelector(state => state.aichat.currentSaveType);
  const havePropertiesChanged = useAppSelector(selectHavePropertiesChanged);

  return (
    <MuiButton
      variant="contained"
      color="primary"
      size="medium"
      disabled={isDisabledDefault || saveInProgress || !havePropertiesChanged}
      className={styles.updateButton}
      id="uitest-update-customizations"
      onClick={onUpdate}
      loading={saveInProgress && currentSaveType === 'updateChatbot'}
      loadingPosition="start"
      startIcon={<FontAwesomeV6Icon iconName="edit" />}
      type="button"
    >
      {'Update'}
    </MuiButton>
  );
};

export default UpdateButton;
