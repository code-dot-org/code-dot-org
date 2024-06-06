import React, {useCallback, useContext} from 'react';

import Button from '@cdo/apps/componentLibrary/button';
import {
  DialogContext,
  DialogType,
} from '@cdo/apps/lab2/views/dialogs/DialogManager';

import {useCodebridgeContext} from '../codebridgeContext';

const WorkspaceHeaderButtons: React.FunctionComponent = () => {
  const dialogControl = useContext(DialogContext);
  const {resetProject} = useCodebridgeContext();

  const onClickStartOver = useCallback(() => {
    if (dialogControl) {
      dialogControl.showDialog(DialogType.StartOver, resetProject);
    }
  }, [dialogControl, resetProject]);

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
