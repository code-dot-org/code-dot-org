import {
  Box,
  Button as MuiButton,
  Typography as MuiTypography,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import ChatBubble from './ChatBubble';

const HintPrompt = ({
  onConfirm,
  onDismiss,
  borderColor,
  backgroundColor,
  isMinecraft,
  skinId,
  textToSpeechEnabled,
}) => {
  let message = msg.hintPromptInline();

  return (
    <ChatBubble
      borderColor={borderColor}
      backgroundColor={backgroundColor}
      ttsMessage={message}
      isMinecraft={isMinecraft}
      skinId={skinId}
      textToSpeechEnabled={textToSpeechEnabled}
    >
      <MuiTypography variant="body4" id="hint-prompt-message">
        {message}
      </MuiTypography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
        }}
      >
        <MuiButton
          variant="outlined"
          color="secondary"
          size="medium"
          id="hint-prompt-yes-button"
          onClick={onConfirm}
          aria-label={msg.yes()}
          type="button"
        >
          {msg.yes()}
        </MuiButton>
        <MuiButton
          variant="outlined"
          color="secondary"
          size="medium"
          id="hint-prompt-no-button"
          onClick={onDismiss}
          aria-label={msg.no()}
          type="button"
        >
          {msg.no()}
        </MuiButton>
      </Box>
    </ChatBubble>
  );
};

HintPrompt.propTypes = {
  borderColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  isMinecraft: PropTypes.bool.isRequired,
  skinId: PropTypes.string.isRequired,
  textToSpeechEnabled: PropTypes.bool,
};

export default HintPrompt;
