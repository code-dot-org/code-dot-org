import React from 'react';

import GenericDialog, {
  GenericDialogBodyProps,
  GenericDialogProps,
} from './GenericDialog';

export type GenericConfirmationDialogProps = Pick<
  GenericDialogProps,
  'title' | 'icon'
> &
  Pick<GenericDialogBodyProps, 'message' | 'bodyComponent'> & {
    handleConfirm?: () => void;
    handleCancel?: () => void;
    handleNeutral?: () => void;
    confirmText?: string;
    neutralText?: string;
    destructive?: boolean;
  };

/**
 * Generic confirmation dialog used in Lab2 labs.
 * The title, message, and confirm button text can be customized.
 * If no confirm button text is provided, the default text is "OK" (translatable).
 */
const GenericConfirmationDialog: React.FunctionComponent<
  GenericConfirmationDialogProps
> = ({
  title,
  message,
  bodyComponent,
  handleConfirm,
  handleCancel,
  handleNeutral,
  confirmText,
  destructive,
  neutralText,
  icon,
}) => {
  const buttons = {
    confirm: {
      callback: handleConfirm,
      text: confirmText,
      destructive: destructive,
    },
    cancel: {
      callback: handleCancel,
    },
    ...(neutralText
      ? {neutral: {text: neutralText, callback: () => handleNeutral?.()}}
      : {}),
  };
  return (
    <GenericDialog
      title={title}
      buttons={buttons}
      icon={icon}
      {...(message ? {message} : {bodyComponent})}
    />
  );
};

export default GenericConfirmationDialog;
