import React from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';

import {DanceAiModalMode} from './types';

interface ModalButtonProps extends React.ComponentProps<typeof Button> {
  currentMode: DanceAiModalMode;
  showFor?: DanceAiModalMode[];
  hideFor?: DanceAiModalMode[];
  enableFor?: DanceAiModalMode[];
  disableFor?: DanceAiModalMode[];
}

const ModalButton: React.FunctionComponent<ModalButtonProps> = props => {
  const {currentMode, showFor, hideFor, enableFor, disableFor} = props;

  if (
    (showFor && !showFor.includes(currentMode)) ||
    (hideFor && hideFor.includes(currentMode))
  ) {
    return null;
  }

  return (
    <Button
      disabled={
        (enableFor && !enableFor.includes(currentMode)) ||
        (disableFor && disableFor.includes(currentMode))
      }
      {...props}
    />
  );
};

export default ModalButton;
