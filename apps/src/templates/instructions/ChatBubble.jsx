import React from 'react';
import {connect} from 'react-redux';
import Radium from 'radium';
import ChatBubbleTip from './ChatBubbleTip';
import { shouldDisplayChatTips } from './utils';
import experiments from '../../experiments';
import InlineAudio from './InlineAudio';

const styles = {
  container: {
    position: 'relative'
  },

  main: {
    backgroundColor: 'white',
    borderRadius: 10,
    margin: '5px 0',
    padding: '5px 10px',
    position: 'relative',
    borderStyle: 'dashed',
    borderWidth: 1,
  },

  minecraft: {
    backgroundColor: '#3B3B3B',
    borderRadius: 4,
    borderWidth: 0
  },

  withAudioControls: {
    paddingRight: 76
  },

  audioControls: {
    position: 'absolute',
    top: 7,
    right: 12
  }
};

const ChatBubble = ({ children, isMinecraft, skinId, borderColor, ttsUrl, ttsMessage }) => {
  borderColor = borderColor || 'white';
  const showAudioControls = experiments.isEnabled('tts') && (ttsUrl || ttsMessage);

  return (
    <div style={styles.container}>
      <div
        style={[
          styles.main,
          isMinecraft && styles.minecraft,
          showAudioControls && styles.withAudioControls,
          { borderColor }
        ]}
      >
        {children}
        {shouldDisplayChatTips(skinId) && <ChatBubbleTip color={borderColor} />}
      </div>
      {showAudioControls &&
        <div style={styles.audioControls}>
          <InlineAudio src={ttsUrl} message={ttsMessage} />
        </div>
      }
    </div>
  );
};

ChatBubble.propTypes = {
  borderColor: React.PropTypes.string,
  children: React.PropTypes.arrayOf(React.PropTypes.node).isRequired,
  isMinecraft: React.PropTypes.bool,
  skinId: React.PropTypes.string,
  ttsUrl: React.PropTypes.string,
  ttsMessage: React.PropTypes.string,
};

export default connect(state => {
  return {
    skinId: state.pageConstants.skinId,
    isMinecraft: !!state.pageConstants.isMinecraft,
  };
})(Radium(ChatBubble));
