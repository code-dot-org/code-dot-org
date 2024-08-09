import React from 'react';

import GenericDialog, {GenericDialogProps} from './GenericDialog';

export type GenericAlertDialogProps = Required<
  Pick<GenericDialogProps, 'title'>
> &
  Pick<GenericDialogProps, 'message'>;

const GenericAlertDialog: React.FunctionComponent<GenericAlertDialogProps> = ({
  title,
  message,
}) => <GenericDialog title={title} message={message} />;

export default GenericAlertDialog;
