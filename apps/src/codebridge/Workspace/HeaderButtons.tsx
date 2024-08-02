import React, {useCallback} from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/lab2Redux';
import {useDialogControl, DialogType} from '@cdo/apps/lab2/views/dialogs';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {useCodebridgeContext} from '../codebridgeContext';

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const dialogControl = useDialogControl();
  const {resetProject} = useCodebridgeContext();
  const isReadOnly = useAppSelector(isReadOnlyWorkspace);

  const onClickStartOver = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog({
        type: DialogType.StartOver,
        handleConfirm: resetProject,
      });
    }
  }, [dialogControl, resetProject]);

  if (isReadOnly) {
    return null;
  }

  return (
    <div>
      <Button
        icon={{iconStyle: 'solid', iconName: 'refresh'}}
        isIconOnly
        color={'black'}
        onClick={onClickStartOver}
        ariaLabel={'Start Over'}
        size={'xs'}
      />
    </div>
  );
};

export default WorkspaceHeaderButtons;
