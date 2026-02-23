import Button from '@code-dot-org/component-library/button';
import {WithTooltip} from '@code-dot-org/component-library/tooltip';
import {Typography} from '@mui/material';
import React, {useCallback, useRef, useState} from 'react';

import moduleStyles from './details-box.module.scss';

interface CopyButtonProps {
  label: string;
  value: string;
}

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
    timerRef.current = setTimeout(() => setCopied(false), 3000);
  }, [value]);

  return (
    <div className={moduleStyles.copyButtonContainer}>
      {copied && (
        <Typography className={moduleStyles.copiedText} variant="body3">
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
        <Button
          icon={{iconStyle: 'solid', iconName: 'copy'}}
          isIconOnly
          size="xs"
          type="tertiary"
          color="gray"
          ariaLabel={`Copy ${label}`}
          onClick={handleCopy}
        />
      </WithTooltip>
    </div>
  );
};

export default CopyButton;
