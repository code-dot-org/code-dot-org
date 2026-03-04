import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useState, useEffect} from 'react';

import copyToClipboard from '@cdo/apps/util/copyToClipboard';

interface CopyButtonProps {
  buttonText: string;
  textToCopy: string;
  ariaLabel?: string;
}

const RESET_TIMEOUT = 2000;

export const CopyButton: React.FC<CopyButtonProps> = ({
  textToCopy,
  buttonText,
  ariaLabel,
}) => {
  const [icon, setIcon] = useState<'copy' | 'check'>('copy');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (icon === 'check') {
      timeout = setTimeout(() => {
        setIcon('copy');
      }, RESET_TIMEOUT);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [icon, setIcon]);

  return (
    <MuiButton
      variant="outlined"
      color="tertiary"
      size="extraSmall"
      onClick={() => copyToClipboard(textToCopy, () => setIcon('check'))}
      aria-label={ariaLabel}
      type="button"
      startIcon={<FontAwesomeV6Icon iconName={icon} iconStyle="solid" />}
    >
      {icon === 'copy' ? buttonText : 'Copied!'}
    </MuiButton>
  );
};
