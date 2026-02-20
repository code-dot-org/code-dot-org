import Button from '@code-dot-org/component-library/button';
import {BodyThreeText} from '@code-dot-org/component-library/typography';
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
        <BodyThreeText className={moduleStyles.copiedText}>
          Copied!
        </BodyThreeText>
      )}
      <Button
        icon={{iconStyle: 'solid', iconName: 'copy'}}
        isIconOnly
        size="xs"
        type="tertiary"
        color="gray"
        ariaLabel={`Copy ${label}`}
        onClick={handleCopy}
      />
    </div>
  );
};

export default CopyButton;
