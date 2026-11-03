// Asked before leaving the pathway for good: the student may keep working
// on the map and project, or finish, which moves on the way any Lab2 level
// does, to the next level or the lesson's end. The same modal as the Hour
// of AI congratulations dialog.

import Modal from '@code-dot-org/component-library/modal';
import React from 'react';

interface FinishDialogProps {
  onKeepWorking: () => void;
  onFinish: () => void;
}

const FinishDialog: React.FunctionComponent<FinishDialogProps> = ({
  onKeepWorking,
  onFinish,
}) => (
  <Modal
    title="Ready to Wrap Up?"
    description="Proceed to see your overall stats and your final project! Or click Keep Working to continue working on your project and skills."
    onClose={onKeepWorking}
    primaryButtonProps={{
      children: 'Finish',
      size: 'small',
      onClick: onFinish,
    }}
    secondaryButtonProps={{
      children: 'Keep Working',
      size: 'small',
      color: 'tertiary',
      variant: 'outlined',
      onClick: onKeepWorking,
    }}
  />
);

export default FinishDialog;
