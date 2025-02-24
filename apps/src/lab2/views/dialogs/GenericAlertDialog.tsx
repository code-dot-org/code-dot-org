import React from 'react';

import GenericDialog, {GenericDialogProps} from './GenericDialog';

export type GenericAlertDialogProps = Pick<GenericDialogProps, 'title'> & {
  message?: GenericDialogProps['message'];
  bodyComponent?: GenericDialogProps['bodyComponent'];
};

const GenericAlertDialog: React.FunctionComponent<GenericAlertDialogProps> = ({
  title,
  message,
  bodyComponent,
}) => (
  <GenericDialog
    title={title}
    message={message}
    bodyComponent={bodyComponent}
  />
);

export default GenericAlertDialog;
