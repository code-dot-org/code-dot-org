import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

interface AiTutorChatContextButtonProps {
  saveSelectionContext: () => void;
}

const AiTutorChatContextButton: React.FC<AiTutorChatContextButtonProps> = ({
  saveSelectionContext,
}) => {
  return (
    <Button
      text="Add to AI Tutor Chat"
      onClick={() => {
        console.log('button');
        saveSelectionContext();
      }}
      size="xs"
      type="tertiary"
      color="black"
      iconLeft={{iconName: 'message-code'}}
    />
  );
};

export default AiTutorChatContextButton;
