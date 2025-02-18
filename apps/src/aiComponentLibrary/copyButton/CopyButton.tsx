import Button from '@code-dot-org/component-library/button';
import React, {useState} from 'react';

import copyToClipboard from '@cdo/apps/util/copyToClipboard';

import style from './copy-button.module.scss';

const CONFIRM_TIMEOUT_MS = 1500;

const CopyButton: React.FC<{copyText: string}> = ({copyText}) => {
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  return (
    <Button
      onClick={() => {
        copyToClipboard(copyText);
        setShowCopyConfirmation(true);
        setTimeout(() => setShowCopyConfirmation(false), CONFIRM_TIMEOUT_MS);
      }}
      color="white"
      size="xs"
      isIconOnly
      icon={{
        iconStyle: 'regular',
        iconName: showCopyConfirmation ? 'check' : 'copy',
      }}
      type="primary"
      className={
        showCopyConfirmation
          ? style.messageFeedbackConfirm
          : style.messageFeedbackButton
      }
    />
  );
};

export default CopyButton;
