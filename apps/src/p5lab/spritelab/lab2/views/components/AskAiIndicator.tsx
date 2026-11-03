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
  onFailureExpired: () => void;
}

/**
 * Renders a spinner for an in-flight AI request, or a transient failure message
 * if a request fails.
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
  }, [status, failed, onFailureExpired]);

  if (!status) {
    return null;
  }
  return (
    <div className={styles.askAiSlot}>
      {status.state === 'failed' ? (
        <Alert type="danger" size="xs" text={status.message} />
      ) : (
        <Alert
          type="gray"
          size="xs"
          // A wait is advisory, so role="status" rather than role="alert".
          isImmediateImportance={false}
          text={
            <span className={styles.pending}>
              <CircularProgress
                className={styles.spinner}
                size={SPINNER_PX}
                aria-hidden
              />
              {PENDING_TEXT}
            </span>
          }
        />
      )}
    </div>
  );
};

export default AskAiIndicator;
