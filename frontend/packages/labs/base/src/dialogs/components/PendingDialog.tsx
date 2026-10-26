import {Typography} from '@mui/material';
import type {FunctionComponent, ReactNode} from 'react';

import {MuiDialog as Dialog} from '@code-dot-org/component-library/dialog';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

type PendingDialogTitleProps = {
  title?: string;
};

type PendingDialogBodyProps =
  | {
      message?: never;
      bodyComponent?: ReactNode;
    }
  | {
      message?: string;
      bodyComponent?: never;
    };

export type PendingDialogProps = PendingDialogTitleProps &
  PendingDialogBodyProps;

import moduleStyles from './generic-dialog.module.scss';

/**
 * A dialog that waits: a message, a spinner, and a disabled button that says
 * so. Mirrors `apps/src/lab2/views/dialogs/PendingDialog.tsx`.
 */
const PendingDialog: FunctionComponent<PendingDialogProps> = ({
  title,
  message,
  bodyComponent,
}) => {
  const customContent = (
    <>
      {bodyComponent ||
        (message && (
          <Typography variant="body2" gutterBottom>
            {message}
          </Typography>
        ))}
      <div className={moduleStyles.spinnerContainer}>
        <FontAwesomeV6Icon
          iconName="spinner"
          animationType="spin"
          className={moduleStyles.spinnerIcon}
        />
      </div>
    </>
  );

  return (
    <Dialog
      title={title}
      customContent={<div id="dsco-dialog-description">{customContent}</div>}
      className={moduleStyles.genericDialog}
      primaryButtonProps={{
        disabled: true,
        loading: true,
        children: 'Loading',
        onClick: () => {},
      }}
    />
  );
};

export default PendingDialog;
