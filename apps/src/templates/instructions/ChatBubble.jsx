import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import ChatBubbleTip from './ChatBubbleTip';
import InlineAudio from './InlineAudio';
import {shouldDisplayChatTips} from './utils';

import styles from './chat-bubble.module.scss';

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

const MINECRAFT_VERY_DARK_GRAY_COLOR =
  'var(--background-neutral-primary-inverse)';

const ChatBubble = ({
  children,
  isMinecraft,
  skinId,
  borderColor,
  backgroundColor,
  isDashed,
  ttsUrl,
  ttsMessage,
  textToSpeechEnabled,
}) => {
  borderColor ||= 'var(--borders-neutral-white-fixed)';
  backgroundColor = isMinecraft
    ? MINECRAFT_VERY_DARK_GRAY_COLOR
    : backgroundColor || 'var(--background-neutral-white-fixed)';
  isDashed = isDashed || false;
  const showAudioControls = textToSpeechEnabled && (ttsUrl || ttsMessage);

  const mainClassName = classNames(styles.main, {
    [styles.minecraft]: isMinecraft,
    [styles.withAudioControls]: showAudioControls,
  });

  return (
    <div className={styles.container}>
      <div
        className={mainClassName}
        style={{
          borderColor,
          backgroundColor,
          borderStyle: isDashed ? 'dashed' : 'solid',
        }}
      >
        {children}
        {shouldDisplayChatTips(skinId) && (
          <ChatBubbleTip
            color={borderColor}
            isDashed={isDashed}
            background={backgroundColor}
          />
        )}
      </div>
      {showAudioControls && (
        <div className={styles.audioControls}>
          <InlineAudio src={ttsUrl} message={ttsMessage} style={audioStyle} />
        </div>
      )}
    </div>
  );
};

ChatBubble.propTypes = {
  borderColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  isDashed: PropTypes.bool,
  children: PropTypes.arrayOf(PropTypes.node).isRequired,
  isMinecraft: PropTypes.bool,
  skinId: PropTypes.string,
  ttsUrl: PropTypes.string,
  ttsMessage: PropTypes.string,
  textToSpeechEnabled: PropTypes.bool,
};

export default ChatBubble;
