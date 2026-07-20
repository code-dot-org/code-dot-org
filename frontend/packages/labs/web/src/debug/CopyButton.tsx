import {IconButton, Typography} from '@mui/material';
import {useCallback, useEffect, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';

import styles from './detailsBox.module.css';

// Copies one details field to the clipboard, confirming inline for a few
// seconds. Ported from apps/src/weblab2/debugPanel/CopyButton.tsx.

const COPY_CONFIRMATION_TIMEOUT_MS = 3000;

export interface CopyButtonProps {
  /** Names the field, for the tooltip and the accessible name. */
  label: string;
  value: string;
}

export const CopyButton = ({label, value}: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clear a pending confirmation on unmount, so the timer cannot fire into a
  // component that is gone (legacy leaves this dangling).
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleCopy = useCallback(() => {
    navigator.clipboard?.writeText(value);
    setCopied(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => setCopied(false),
      COPY_CONFIRMATION_TIMEOUT_MS,
    );
  }, [value]);

  return (
    <div className={styles.copyButtonContainer}>
      {copied && (
        <Typography className={styles.copiedText} variant="body3">
          Copied!
        </Typography>
      )}
      <WithTooltip
        tooltipProps={{
          tooltipId: `copy-${label}-tooltip`,
          direction: 'onTop',
          size: 'xs',
          text: `Copy ${label}`,
        }}
      >
        <IconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          type="button"
        >
          <FontAwesomeV6Icon iconStyle="solid" iconName="copy" />
        </IconButton>
      </WithTooltip>
    </div>
  );
};
