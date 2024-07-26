import React from 'react';
import Button from '@cdo/apps/templates/Button';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';

interface CopyUrlButtonProps {
  textToCopy: string;
}

const CopyUrlButton: React.FunctionComponent<CopyUrlButtonProps> = ({
  textToCopy,
}) => {
  const handleCopy = () => {
    copyToClipboard(
      textToCopy,
      () => alert('Text copied to clipboard'),
      () => {
        console.error('Error in copying text');
      }
    );
  };

  return (
    <Button
      color={Button.ButtonColor.white}
      icon={'clipboard'}
      key="copy"
      onClick={() => handleCopy()}
      size={Button.ButtonSize.small}
      text="Copy Image URL"
    />
  );
};

export default CopyUrlButton;
