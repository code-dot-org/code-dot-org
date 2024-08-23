import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import {Button, buttonColors} from '@cdo/apps/componentLibrary/button';
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
      <Button
        id="hint-prompt-yes-button"
        type="primary"
        text={msg.yes()}
        color={buttonColors.white}
        onClick={onConfirm}
        className={classNames(styles.button, styles.buttonYes)}
        size="m"
        ariaLabel={msg.yes()}
      />
      <Button
        id="hint-prompt-no-button"
        type="primary"
        text={msg.no()}
        color={buttonColors.white}
        onClick={onDismiss}
        className={classNames(styles.button)}
        size="m"
        ariaLabel={msg.no()}
      />
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
