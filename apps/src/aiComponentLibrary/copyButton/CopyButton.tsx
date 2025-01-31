import Button from '@code-dot-org/component-library/button';
import React, {useState} from 'react';

import style from './copy-button.module.scss';

// Fallback method for browsers that do not support navigator.clipboard
const copyToClipboard = (text: string) => {
  const textField = document.createElement('textarea');
  textField.innerText = text;
  document.body.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  textField.remove();
};

const CopyButton: React.FC<{copyText: string}> = ({copyText}) => {
  const CONFIRM_TIMEOUT_MS = 1500;
  const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);

  return (
    <Button
      onClick={() => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(copyText);
        } else {
          copyToClipboard(copyText);
        }
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
