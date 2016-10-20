import React from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import ChatBubbleTip from './ChatBubbleTip';
import { shouldDisplayChatTips } from './utils';

// Minecraft-specific styles
const craftStyle = {
  backgroundColor: '#3B3B3B',
  borderRadius: 4,
  borderWidth: 0
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

const ChatBubble = ({ children, isMinecraft, skinId, borderColor }) => {
  borderColor = borderColor || 'white';

  return (
    <div style={[style, isMinecraft && craftStyle, { borderColor }]}>
      {children}
      {shouldDisplayChatTips(skinId) && <ChatBubbleTip color={borderColor} />}
    </div>
  );
};

ChatBubble.propTypes = {
  borderColor: React.PropTypes.string,
  children: React.PropTypes.arrayOf(React.PropTypes.node).isRequired,
  isMinecraft: React.PropTypes.bool,
  skinId: React.PropTypes.string
};

export default connect(state => {
  return {
    skinId: state.pageConstants.skinId,
    isMinecraft: !!state.pageConstants.isMinecraft,
  };
})(Radium(ChatBubble));
