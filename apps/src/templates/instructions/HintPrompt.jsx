import React from 'react';
import Radium from 'radium';
import color from '../../color';
import ChatBubble from './ChatBubble';

const HintPrompt = ({ styles, onConfirm, onDismiss, isMinecraft, borderColor }) => {
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

  return (
    <ChatBubble isMinecraft={isMinecraft} borderColor={borderColor}>
      <p>Do you want a hint?</p>
      <button onClick={onConfirm} style={[buttonStyles.common, buttonStyles.yes]}>Yes</button>
      <button onClick={onDismiss} style={[buttonStyles.common, buttonStyles.no]}>No</button>
    </ChatBubble>
  );
};

HintPrompt.propTypes = {
  borderColor: React.PropTypes.string,
  isMinecraft: React.PropTypes.bool,
  onConfirm: React.PropTypes.func.isRequired,
  onDismiss: React.PropTypes.func.isRequired,
  styles: React.PropTypes.object.isRequired,
};

export default Radium(HintPrompt);
