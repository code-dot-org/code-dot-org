import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

interface AiTutorChatContextButtonProps {
  saveSelectionContext: () => void;
}

const AiTutorChatContextButton: React.FC<AiTutorChatContextButtonProps> = ({
  saveSelectionContext,
}) => {
  return (
    <Button
      text={codebridgeI18n.addToAiTutorContext()}
      onClick={saveSelectionContext}
      size="xs"
      type="tertiary"
      color="black"
      iconLeft={{iconName: 'message-code'}}
    />
  );
};

export default AiTutorChatContextButton;
