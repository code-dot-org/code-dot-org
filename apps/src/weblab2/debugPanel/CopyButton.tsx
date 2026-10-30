import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, IconButton as MuiIconButton, Tooltip} from '@mui/material';
import React, {useCallback, useRef, useState} from 'react';

import moduleStyles from './details-box.module.scss';

interface CopyButtonProps {
  label: string;
  value: string;
}

const COPY_CONFIRMATION_TIMEOUT_MS = 3000;

const CopyButton: React.FunctionComponent<CopyButtonProps> = ({
  label,
  value,
}) => {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    timerRef.current && clearTimeout(timerRef.current);
    timerRef.current = setTimeout(
      () => setCopied(false),
      COPY_CONFIRMATION_TIMEOUT_MS
    );
  }, [value]);

  return (
    <div className={moduleStyles.copyButtonContainer}>
      {copied && (
        <Typography className={moduleStyles.copiedText} variant="body3">
          Copied!
        </Typography>
      )}
      <Tooltip placement="top" title={`Copy ${label}`}>
        <MuiIconButton
          variant="text"
          color="tertiary"
          size="extraSmall"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          type="button"
        >
          <FontAwesomeV6Icon iconStyle="solid" iconName="copy" />
        </MuiIconButton>
      </Tooltip>
    </div>
  );
};

export default CopyButton;
