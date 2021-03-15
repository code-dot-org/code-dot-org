import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import color from '../../util/color';
import ChatBubble from './ChatBubble';
import msg from '@cdo/locale';

const HintPrompt = ({
  onConfirm,
  onDismiss,
  borderColor,
  isMinecraft,
  skinId,
  textToSpeechEnabled
}) => {
  const buttonStyles = {
    common: {
      color: 'white',
      minWidth: 100
    },
    yes: {
      backgroundColor: color.orange,
      borderColor: color.orange
    },
    no: {
      backgroundColor: color.green,
      borderColor: color.green
    }
  };

  let message = msg.hintPromptInline();

  return (
    <ChatBubble
      borderColor={borderColor}
      ttsMessage={message}
      isMinecraft={isMinecraft}
      skinId={skinId}
      textToSpeechEnabled={textToSpeechEnabled}
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onConfirm}
        style={[buttonStyles.common, buttonStyles.yes]}
      >
        {msg.yes()}
      </button>
      <button
        type="button"
        onClick={onDismiss}
        style={[buttonStyles.common, buttonStyles.no]}
      >
        {msg.no()}
      </button>
    </ChatBubble>
  );
};

HintPrompt.propTypes = {
  borderColor: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
  isMinecraft: PropTypes.bool.isRequired,
  skinId: PropTypes.string.isRequired,
  textToSpeechEnabled: PropTypes.bool
};

export default Radium(HintPrompt);
