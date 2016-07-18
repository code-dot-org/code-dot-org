import React from 'react';
import Radium from 'radium';
import ReadOnlyBlockSpace from '../ReadOnlyBlockSpace';
import ChatBubbleTip from './ChatBubbleTip';

// Minecraft-specific styles
const craftStyle = {
  backgroundColor: '#3B3B3B',
  borderRadius: 4,
  borderStyle: 'solid',
};

const style = {
  backgroundColor: 'white',
  borderRadius: 10,
  margin: '5px 0',
  padding: '5px 10px',
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
      {!isMinecraft && <ChatBubbleTip color={borderColor} />}
    </div>
  );
};

ChatBubble.propTypes = {
  borderColor: React.PropTypes.string,
  children: React.PropTypes.arrayOf(React.PropTypes.node).isRequired,
  isMinecraft: React.PropTypes.bool,
};

export default Radium(ChatBubble);
