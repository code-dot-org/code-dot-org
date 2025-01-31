import {Button} from '@code-dot-org/component-library/button';
import React, {useCallback} from 'react';

import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import aichatI18n from '../../locale';
import {
  selectHavePropertiesChanged,
  updateAiCustomization,
} from '../../redux/aichatRedux';

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
    <Button
      id="uitest-update-customizations"
      text={aichatI18n.modelCustomization_updateButtonText()}
      disabled={isDisabledDefault || saveInProgress || !havePropertiesChanged}
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
