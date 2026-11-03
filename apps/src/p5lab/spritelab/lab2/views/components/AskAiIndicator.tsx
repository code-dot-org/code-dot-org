import Alert from '@code-dot-org/component-library/alert';
import {CircularProgress} from '@mui/material';
import React, {useEffect} from 'react';

import {AskAiStatus} from '../../redux/spriteLab2Redux';

import styles from './ask-ai-indicator.module.scss';

const PENDING_TEXT = 'Waiting for AI response';

// Matches the alert's own extra-small icon size.
const SPINNER_PX = 14;

export const FAILURE_VISIBLE_MS = 10000;

interface AskAiIndicatorProps {
  status: AskAiStatus | null;
  /** Called once a failure has been on screen long enough to read. */
  onFailureExpired: () => void;
}

/**
 * What the ask AI block is doing, shown in the bar under the playspace: a
 * spinner while a request is out, then a failure message for ten seconds.
 */
const AskAiIndicator: React.FunctionComponent<AskAiIndicatorProps> = ({
  status,
  onFailureExpired,
}) => {
  const failed = status?.state === 'failed';
  useEffect(() => {
    if (!failed) {
      return;
    }
    const timer = window.setTimeout(onFailureExpired, FAILURE_VISIBLE_MS);
    return () => window.clearTimeout(timer);
    // A fresh failure is a new status object, which restarts the countdown.
  }, [status, failed, onFailureExpired]);

  if (!status) {
    return null;
  }
  if (status.state === 'failed') {
    return (
      <Alert
        className={styles.askAiIndicator}
        type="danger"
        size="xs"
        text={status.message}
      />
    );
  }
  return (
    <Alert
      className={styles.askAiIndicator}
      type="gray"
      size="xs"
      // A wait is advisory, so role="status" rather than role="alert".
      isImmediateImportance={false}
      text={
        <span className={styles.pending}>
          <CircularProgress size={SPINNER_PX} aria-hidden />
          {PENDING_TEXT}
        </span>
      }
    />
  );
};

export default AskAiIndicator;
