import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import React from 'react';

import msg from '@cdo/locale';

import LegacyButton from '../../legacySharedComponents/LegacyButton';

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
      <p id={'hint-prompt-message'}>{message}</p>
      <LegacyButton
        id="hint-prompt-yes-button"
        type="cancel"
        onClick={onConfirm}
        style={{marginRight: 5}}
        aria-labelledby="hint-prompt-message"
      >
        {msg.yes()}
      </LegacyButton>
      <LegacyButton
        type="cancel"
        onClick={onDismiss}
        aria-labelledby="hint-prompt-message"
      >
        {msg.no()}
      </LegacyButton>
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

export default Radium(HintPrompt);
