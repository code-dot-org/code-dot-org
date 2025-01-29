import React, {useState} from 'react';

import Button from '@cdo/apps/componentLibrary/button/Button';

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
  const [copyTimeout, setCopyTimeout] = useState(false);

  return (
    <Button
      onClick={() => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(copyText);
        } else {
          copyToClipboard(copyText);
        }
        setCopyTimeout(true);
        setTimeout(() => setCopyTimeout(false), CONFIRM_TIMEOUT_MS);
      }}
      color="white"
      size="xs"
      isIconOnly
      icon={{
        iconStyle: 'regular',
        iconName: copyTimeout ? 'check' : 'copy',
      }}
      type="primary"
      className={
        copyTimeout ? style.messageFeedbackConfirm : style.messageFeedbackButton
      }
    />
  );
};

export default CopyButton;
