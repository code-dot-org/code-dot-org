import React from 'react';

import GenericDialog, {GenericDialogProps} from './GenericDialog';

export type GenericConfirmationDialogProps = Required<
  Pick<GenericDialogProps, 'title' | 'message'>
> & {
  handleConfirm: () => void;
  handleCancel?: () => void;
  confirmText?: string;
};

/**
 * Generic confirmation dialog used in Lab2 labs.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */
const GenericConfirmationDialog: React.FunctionComponent<
  GenericConfirmationDialogProps
> = ({title, message, handleConfirm, handleCancel, confirmText}) => (
  <GenericDialog
    title={title}
    message={message}
    buttons={{
      confirm: {
        callback: handleConfirm,
        text: confirmText,
      },
      cancel: {
        callback: handleCancel,
      },
    }}
  />
);

export default GenericConfirmationDialog;
