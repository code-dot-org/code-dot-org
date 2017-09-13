import React, {PropTypes} from 'react';
import Radium from 'radium';
import color from "../../util/color";
import ChatBubble from './ChatBubble';
import msg from '@cdo/locale';

const HintPrompt = ({ onConfirm, onDismiss, borderColor }) => {
  const buttonStyles = {
    common: {
      color: 'white',
      minWidth: 100
    },
    yes: {
      backgroundColor: color.orange,
      borderColor: color.orange,
    },
    no: {
      backgroundColor: color.green,
      borderColor: color.green,
    }
  };

  let message = msg.hintPromptInline();

  return (
    <ChatBubble borderColor={borderColor} ttsMessage={message}>
      <p>{message}</p>
      <button onClick={onConfirm} style={[buttonStyles.common, buttonStyles.yes]}>{msg.yes()}</button>
      <button onClick={onDismiss} style={[buttonStyles.common, buttonStyles.no]}>{msg.no()}</button>
    </ChatBubble>
  );
};

HintPrompt.propTypes = {
  borderColor: PropTypes.string,
  onConfirm: PropTypes.func.isRequired,
  onDismiss: PropTypes.func.isRequired,
};

export default Radium(HintPrompt);
