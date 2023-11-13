import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import ChatBubble from './ChatBubble';
import msg from '@cdo/locale';
import LegacyButton from '../LegacyButton';

const HintPrompt = ({
  onConfirm,
  onDismiss,
  borderColor,
  isDashed,
  isMinecraft,
  skinId,
  textToSpeechEnabled,
}) => {
  let message = msg.hintPromptInline();

  return (
    <ChatBubble
      borderColor={borderColor}
      isDashed={isDashed}
      ttsMessage={message}
      isMinecraft={isMinecraft}
      skinId={skinId}
      textToSpeechEnabled={textToSpeechEnabled}
    >
      <p>{message}</p>
      <LegacyButton type="cancel" onClick={onConfirm} style={{marginRight: 5}}>
        {msg.yes()}
      </LegacyButton>
      <LegacyButton type="cancel" onClick={onDismiss}>
        {msg.no()}
      </LegacyButton>
    </ChatBubble>
  );
};

HintPrompt.propTypes = {
  borderColor: PropTypes.string,
  isDashed: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  isMinecraft: PropTypes.bool.isRequired,
  skinId: PropTypes.string.isRequired,
  textToSpeechEnabled: PropTypes.bool,
};

export default Radium(HintPrompt);
