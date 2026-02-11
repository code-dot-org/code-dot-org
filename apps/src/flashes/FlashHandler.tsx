import Alert, {AlertProps} from '@code-dot-org/component-library/alert';
import {Snackbar} from '@mui/material';
import React, {FC, useState} from 'react';

type FlashType = 'notice' | 'alert';

type FlashMessage = string | string[];

export type Flash = [FlashType, FlashMessage][];

const DEFAULT_DURATION = 6_000; // 6 seconds

export const FlashHandler: FC<{
  flash?: Flash;
  autoHideDuration?: number;
  onClose?: () => void;
}> = ({flash, autoHideDuration = DEFAULT_DURATION, onClose}) => {
  const [showFlash, setShowFlash] = useState(!!flash?.length);

  const getAlertType = (flashType: FlashType): AlertProps['type'] => {
    switch (flashType) {
      case 'alert':
        return 'danger';
      case 'notice':
        return 'success';
      default:
        return 'primary';
    }
  };

  const handleClose = () => {
    setShowFlash(false);
    onClose && onClose();
  };

  if (!flash?.length) {
    return null;
  }

  // rails flash could contain multiple flash types and multiple messages per type
  // presently only supporting the first type and message
  const [type, message] = flash[0];
  const text = Array.isArray(message) ? message[0] : message;

  return (
    <Snackbar
      anchorOrigin={{vertical: 'top', horizontal: 'center'}}
      open={showFlash}
      autoHideDuration={autoHideDuration}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        handleClose();
      }}
    >
      <Alert type={getAlertType(type)} text={text} onClose={handleClose} />
    </Snackbar>
  );
};
