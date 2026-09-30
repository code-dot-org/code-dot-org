import {Button as MuiButton} from '@mui/material';
import React from 'react';

import styles from './submitButton.module.scss';

interface SubmitButtonProps {
  disabled?: boolean;
  /** Ignores clicks but stays enabled: a disabled button drops its focus. */
  locked?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const SubmitButton: React.FunctionComponent<SubmitButtonProps> = ({
  disabled,
  locked,
  onClick,
  children,
}) => (
  <MuiButton
    type="button"
    variant="contained"
    color="primary"
    size="large"
    className={styles.pillButton}
    disabled={disabled}
    aria-disabled={locked || undefined}
    onClick={locked ? undefined : onClick}
  >
    {children}
  </MuiButton>
);

export default SubmitButton;
