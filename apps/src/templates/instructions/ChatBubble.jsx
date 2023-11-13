import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium'; // eslint-disable-line no-restricted-imports
import ChatBubbleTip from './ChatBubbleTip';
import {shouldDisplayChatTips} from './utils';
import InlineAudio from './InlineAudio';

const styles = {
  container: {
    position: 'relative',
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
    borderWidth: 2,
  },

  minecraft: {
    backgroundColor: '#3B3B3B',
    borderRadius: 4,
    borderWidth: 0,
  },

  withAudioControls: {
    paddingRight: 76,
  },

  audioControls: {
    position: 'absolute',
    top: 7,
    right: 12,
  },
};

var audioStyle = {
  wrapper: {
    position: 'relative',
  },
  button: {
    height: '32px',
  },
  buttonImg: {
    lineHeight: '28px',
    fontSize: 20,
  },
};

const ChatBubble = ({
  children,
  isMinecraft,
  skinId,
  borderColor,
  isDashed,
  ttsUrl,
  ttsMessage,
  textToSpeechEnabled,
}) => {
  borderColor = borderColor || 'white';
  isDashed = isDashed || false;
  const showAudioControls = textToSpeechEnabled && (ttsUrl || ttsMessage);

  return (
    <div style={styles.container}>
      <div
        style={[
          styles.main,
          isMinecraft && styles.minecraft,
          showAudioControls && styles.withAudioControls,
          {borderColor},
          {borderStyle: isDashed ? 'dashed' : 'solid'},
        ]}
      >
        {children}
        {shouldDisplayChatTips(skinId) && (
          <ChatBubbleTip color={borderColor} isDashed={isDashed} />
        )}
      </div>
      {showAudioControls && (
        <div style={styles.audioControls}>
          <InlineAudio src={ttsUrl} message={ttsMessage} style={audioStyle} />
        </div>
      )}
    </div>
  );
};

ChatBubble.propTypes = {
  borderColor: PropTypes.string,
  isDashed: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  isMinecraft: PropTypes.bool,
  skinId: PropTypes.string,
  ttsUrl: PropTypes.string,
  ttsMessage: PropTypes.string,
  textToSpeechEnabled: PropTypes.bool,
};

export default Radium(ChatBubble);
