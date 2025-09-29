import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

interface AddToAiTutorChatButtonProps {
  saveSelectionContext: () => void;
}

const AddToAiTutorChatButton: React.FC<AddToAiTutorChatButtonProps> = ({
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

export default AddToAiTutorChatButton;
