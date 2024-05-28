import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import React, {useCallback} from 'react';
import {updateAiCustomization} from '../../redux/aichatRedux';
import {Button} from '@cdo/apps/componentLibrary/button';
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

  return (
    <Button
      text="Update"
      disabled={isDisabledDefault || saveInProgress}
      iconLeft={
        saveInProgress && currentSaveType === 'updateChatbot'
          ? {iconName: 'spinner', animationType: 'spin'}
          : {iconName: 'edit'}
      }
      onClick={onUpdate}
      className={styles.updateButton}
    />
  );
};

export default UpdateButton;
