import type {FunctionComponent} from 'react';

import GenericDialog, {type GenericDialogProps} from './GenericDialog';

export type SkipDialogProps = GenericDialogProps & {
  handleConfirm?: () => void;
  handleCancel?: () => void;
};

const SkipDialog: FunctionComponent<SkipDialogProps> = ({
  handleConfirm,
  handleCancel,
}) => (
  <GenericDialog
    title="Are you sure you want to skip the tutorial?"
    message="This will skip the tutorial and take you to the project."
    buttons={{
      confirm: {
        callback: handleConfirm,
        text: 'Skip to project',
      },
      cancel: {
        callback: handleCancel,
      },
    }}
  />
);

export default SkipDialog;
