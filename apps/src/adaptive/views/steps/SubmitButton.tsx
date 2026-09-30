import {Button as MuiButton} from '@mui/material';
import React from 'react';

import styles from './submitButton.module.scss';

interface SubmitButtonProps {
  disabled?: boolean;
  /**
   * Ignores clicks without the disabled attribute, so a button holding
   * focus keeps it through a pause.
   */
  locked?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

/** The pill button under each question. */
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
