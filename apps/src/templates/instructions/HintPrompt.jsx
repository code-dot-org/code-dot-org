import {Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import ChatBubble from './ChatBubble';

import styles from './hint-prompt.module.scss';

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
    >
      <p id={'hint-prompt-message'}>{message}</p>
      <MuiButton
        variant="contained"
        color="white"
        size="medium"
        className={classNames(styles.button, styles.buttonYes)}
        id="hint-prompt-yes-button"
        onClick={onConfirm}
        aria-label={msg.yes()}
        type="button"
      >
        {msg.yes()}
      </MuiButton>
      <MuiButton
        variant="contained"
        color="white"
        size="medium"
        className={classNames(styles.button)}
        id="hint-prompt-no-button"
        onClick={onDismiss}
        aria-label={msg.no()}
        type="button"
      >
        {msg.no()}
      </MuiButton>
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

export default HintPrompt;
