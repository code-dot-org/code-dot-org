import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

interface AiTutorChatContextButtonProps {
  text: string;
  startingLine: number;
  endingLine: number;
  saveSelectionContext: (
    text: string,
    startingLine: number,
    endingLine: number
  ) => void;
}

const AiTutorChatContextButton: React.FC<AiTutorChatContextButtonProps> = ({
  text,
  startingLine,
  endingLine,
  saveSelectionContext,
}) => {
  return (
    <Button
      text="Add to AI Tutor Chat"
      onClick={() => {
        console.log('button');
        saveSelectionContext(text, startingLine, endingLine);
      }}
      size="xs"
      type="tertiary"
      color="black"
      iconLeft={{iconName: 'message-code'}}
    />
  );
};

export default AiTutorChatContextButton;
