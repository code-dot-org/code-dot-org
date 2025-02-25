import React from 'react';

import GenericDialog, {
  GenericDialogProps,
  GenericDialogBodyProps,
} from './GenericDialog';

export type GenericAlertDialogProps = Pick<GenericDialogProps, 'title'> &
  GenericDialogBodyProps;

/**
 * Generic alert dialog used in Lab2 labs.
 * Allows a title message
 * A body component or message
 * A confirm "OK" button
 */
const GenericAlertDialog: React.FunctionComponent<GenericAlertDialogProps> = ({
  title,
  message,
  bodyComponent,
}) => {
  return message ? (
    <GenericDialog title={title} message={message} />
  ) : (
    <GenericDialog title={title} bodyComponent={bodyComponent} />
  );
};
export default GenericAlertDialog;
