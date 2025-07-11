import React, {MutableRefObject} from 'react';

import Typography from '@code-dot-org/component-library/typography';

import {FrequencyData} from '../types';

import moduleStyles from './frequencyLevel.module.scss';

const DEFAULT_MESSAGE: string =
  "Here is a plain text message that hasn't been encrypted at all.   You can click the buttons below to shift the alphabet left or right to encrypt this message with a Caesar cipher of your choice.  You can also load other encrypted messages and use the tool to see if you can crack the message.";

export interface MessageProps {
  message?: string;
  frequencyData: MutableRefObject<FrequencyData>;
  /**
   * The current cipher state. When this updates, the cipher has changed and it will re-render the message.
   */
  state: string;
}

/**
 * This represents the encrypted message.
 */
const Message: React.FunctionComponent<MessageProps> = ({
  message,
  frequencyData,
  state,
}) => {
  message ||= DEFAULT_MESSAGE;

  const {letters, cipher} = frequencyData.current;

  return (
    <div data-state={state} className={moduleStyles.messageContainer}>
      {message.split('').map((letter, i) => {
        const encrypted = cipher.has(letter);
        const encryptable =
          letters.includes(letter) || letters.includes(letter.toUpperCase());

        return (
          <Typography
            semanticTag="span"
            visualAppearance="body-one"
            key={`message-letter-${i}`}
            data-original-letter={letter}
            data-notranslate
            className={
              encrypted || !encryptable
                ? undefined
                : moduleStyles.encryptedMessageLetter
            }
          >
            {encrypted ? cipher.get(letter) : letter}
          </Typography>
        );
      })}
    </div>
  );
};

export default Message;
