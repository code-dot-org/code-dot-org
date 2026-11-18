// Callout anchored below the "My project" tab, shown the first time the
// student returns to the skill map after completing every checkpoint.

import CloseButton from '@code-dot-org/component-library/closeButton';
import {Typography as MuiTypography} from '@mui/material';
import React from 'react';

import styles from './finalProjectCallout.module.scss';

interface FinalProjectCalloutProps {
  onDismiss: () => void;
}

const FinalProjectCallout: React.FunctionComponent<
  FinalProjectCalloutProps
> = ({onDismiss}) => (
  <div className={styles.callout} role="status">
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
        Keep working on your project
      </MuiTypography>
      <MuiTypography variant="body3" className={styles.content}>
        Great work! You&apos;ve completed all the checkpoints. Use this tab to
        access your project and keep working on your own.
      </MuiTypography>
    </div>
  </div>
);

export default FinalProjectCallout;
