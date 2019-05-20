import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import Radium from 'radium';
import ChatBubbleTip from './ChatBubbleTip';
import {shouldDisplayChatTips} from './utils';

const styles = {
  container: {
    position: 'relative'
  },

  main: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: '5px 0',
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 10,
    paddingRight: 10,
    position: 'relative',
    borderStyle: 'dashed',
    borderWidth: 1
  },

  minecraft: {
    backgroundColor: '#3B3B3B',
    borderRadius: 4,
    borderWidth: 0
  }
};

const ChatBubble = ({
  children,
  isMinecraft,
  skinId,
  borderColor,
  ttsUrl,
  ttsMessage,
  textToSpeechEnabled
}) => {
  borderColor = borderColor || 'white';

  return (
    <div style={styles.container}>
      <div
        style={[styles.main, isMinecraft && styles.minecraft, {borderColor}]}
      >
        {children}
        {shouldDisplayChatTips(skinId) && <ChatBubbleTip color={borderColor} />}
      </div>
    </div>
  );
};

ChatBubble.propTypes = {
  borderColor: PropTypes.string,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  isMinecraft: PropTypes.bool,
  skinId: PropTypes.string,
  ttsUrl: PropTypes.string,
  ttsMessage: PropTypes.string,
  textToSpeechEnabled: PropTypes.bool
};

export default connect(state => {
  return {
    skinId: state.pageConstants.skinId,
    isMinecraft: !!state.pageConstants.isMinecraft,
    textToSpeechEnabled:
      state.pageConstants.textToSpeechEnabled || state.pageConstants.isK1
  };
})(Radium(ChatBubble));
