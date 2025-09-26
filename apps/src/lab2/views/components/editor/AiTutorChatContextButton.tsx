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
      text="button!"
      onClick={() => {
        console.log('button');
        saveSelectionContext(text, startingLine, endingLine);
      }}
    />
  );
};

export default AiTutorChatContextButton;
