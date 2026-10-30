import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React from 'react';

import codebridgeI18n from '@cdo/apps/codebridge/locale';

interface AddToAiTutorChatButtonProps {
  saveSelectionContext: () => void;
}

const AddToAiTutorChatButton: React.FC<AddToAiTutorChatButtonProps> = ({
  saveSelectionContext,
}) => {
  return (
    <MuiButton
      variant="text"
      color="secondary"
      size="extraSmall"
      loadingPosition="start"
      onClick={saveSelectionContext}
      type="button"
      startIcon={<FontAwesomeV6Icon iconName="message-code" />}
    >
      {codebridgeI18n.addToAiTutorContext()}
    </MuiButton>
  );
};

export default AddToAiTutorChatButton;
