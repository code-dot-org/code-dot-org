// A dismissable card with a caret, anchored under whatever its parent
// positions it against.

import CloseButton from '@code-dot-org/component-library/closeButton';
import {Typography as MuiTypography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import styles from './callout.module.scss';

interface CalloutProps {
  title: string;
  body: string;
  onDismiss: () => void;
  /** Which edge of the anchor the caret sits under. */
  align: 'start' | 'end';
  className?: string;
}

const Callout: React.FunctionComponent<CalloutProps> = ({
  title,
  body,
  onDismiss,
  align,
  className,
}) => (
  <div
    className={classNames(styles.callout, styles[align], className)}
    role="status"
  >
    <div className={styles.caret} aria-hidden="true" />
    <div className={styles.body}>
      <CloseButton
        className={styles.close}
        onClick={onDismiss}
        aria-label="Dismiss"
        size="xs"
      />
      <MuiTypography
        variant="body1"
        className={styles.title}
        sx={{fontWeight: 600}}
      >
        {title}
      </MuiTypography>
      <MuiTypography variant="body3" className={styles.content}>
        {body}
      </MuiTypography>
    </div>
  </div>
);

export default Callout;
