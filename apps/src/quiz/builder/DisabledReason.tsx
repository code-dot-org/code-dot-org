import {buttonClasses, Tooltip} from '@mui/material';
import React from 'react';

import styles from './disabled-reason.module.scss';

// Keeps a disabled-looking control focusable so keyboard users can reach its reason.
export const ariaDisabledProps = (reason?: string) =>
  reason
    ? {
        'aria-disabled': true,
        'aria-description': reason,
        className: buttonClasses.disabled,
        // Also replaces ActionDropdown's toggle, so its menu stays shut.
        onClick: () => {},
      }
    : {};

// The tooltip sits on a wrapper: MUI's disabled class sets pointer-events: none.
const DisabledReason: React.FunctionComponent<{
  reason?: string;
  children: React.ReactElement;
}> = ({reason, children}) => (
  <Tooltip describeChild title={reason ?? ''} enterDelay={0} enterNextDelay={0}>
    <span className={styles.anchor}>{children}</span>
  </Tooltip>
);

export default DisabledReason;
