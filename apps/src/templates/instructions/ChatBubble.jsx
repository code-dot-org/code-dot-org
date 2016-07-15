import React from 'react';
import Radium from 'radium';
import ReadOnlyBlockSpace from '../ReadOnlyBlockSpace';
import ChatBubbleTip from './ChatBubbleTip';

// Minecraft-specific styles
const craftStyle = {
  backgroundColor: '#3B3B3B',
  borderRadius: 4
};

const style = {
  backgroundColor: 'white',
  borderRadius: 10,
  marginBottom: 10,
  padding: 10,
  position: 'relative',
  borderStyle: 'dashed',
  borderWidth: 1,
};

const ChatBubble = ({ children, isMinecraft, borderColor }) => {
  isMinecraft = isMinecraft || false;
  borderColor = borderColor || 'white';

  return (
    <div style={[style, isMinecraft && craftStyle, { borderColor }]}>
      {children}
      <ChatBubbleTip color={borderColor} />
    </div>
  );
};

ChatBubble.propTypes = {
  borderColor: React.PropTypes.string,
  children: React.PropTypes.arrayOf(React.PropTypes.node).isRequired,
  isMinecraft: React.PropTypes.bool,
};

export default Radium(ChatBubble);
