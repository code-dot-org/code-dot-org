import {Button, buttonColors} from '@code-dot-org/component-library/button';
import React, {useState, useEffect} from 'react';

import copyToClipboard from '@cdo/apps/util/copyToClipboard';

interface CopyLinkButtonProps {
  link: string;
  ariaLabel?: string;
}

const RESET_TIMEOUT = 2000;

export const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  link,
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
    <Button
      text={icon === 'copy' ? 'Copy link' : 'Copied!'}
      type="secondary"
      size="xs"
      color={buttonColors.gray}
      iconLeft={{iconName: icon, iconStyle: 'solid'}}
      onClick={() => copyToClipboard(link, () => setIcon('check'))}
      ariaLabel={ariaLabel}
    />
  );
};
