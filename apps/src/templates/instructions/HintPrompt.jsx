import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import ChatBubble from './ChatBubble';
import msg from '@cdo/locale';
import Button from '@cdo/apps/templates/Button';

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
      isHintPrompt={true}
    >
      <p>{message}</p>
      <Button
        type="cancel"
        onClick={onConfirm}
        size={'medium'}
        text={msg.yes()}
      />
      <Button
        type="cancel"
        onClick={onDismiss}
        size={'medium'}
        text={msg.no()}
      />
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
