import classNames from 'classnames';
import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
  MutableRefObject,
} from 'react';

import Typography from '@code-dot-org/component-library/typography';

import {FrequencyData} from '../types';

import moduleStyles from './frequencyLevel.module.scss';

const DEFAULT_MESSAGE: string =
  "Here café jalapeño is a plain text message that hasn't been encrypted at all.   You can click the buttons below to shift the alphabet left or right to encrypt this message with a Caesar cipher of your choice.  You can also load other encrypted messages and use the tool to see if you can crack the message.";

export interface MessageProps {
  frequencyData: MutableRefObject<FrequencyData>;
  /** The base encoded message */
  message?: string;
  /**
   * The current cipher state. When this updates, the cipher has changed and it will re-render the message.
   */
  state: string;
  /** Callback for when the message data changes */
  onUpdate?: () => void;
}

/**
 * This represents the encrypted message.
 */
const Message: React.FunctionComponent<MessageProps> = ({
  frequencyData,
  message,
  state,
  onUpdate,
}) => {
  message ||= DEFAULT_MESSAGE;

  const [normalizedMessage, setNormalizedMessage] = useState<string[]>([]);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const {letters, cipher} = frequencyData.current;

  useEffect(() => {
    const {letters} = frequencyData.current;

    // Keep every character in the string
    const exploded = message.split('');
    let result = [];

    // Get the total count of encryptable letters and their frequencies
    let total = 0;
    const counts = frequencyData.current.letters.slice().fill(0);

    // For any character that isn't in our letter set, we might want to
    // exploded it more.
    for (const unicodeCharacter of exploded) {
      const chunk = !letters.includes(unicodeCharacter.toUpperCase())
        ? unicodeCharacter.normalize('NFD').split('')
        : [unicodeCharacter];

      for (const letter of chunk) {
        const index = frequencyData.current.alphabetical.indexOf(
          letter.toUpperCase(),
        );
        if (index >= 0) {
          counts[index]++;
          total++;
        }
      }

      result = result.concat(chunk);
    }

    frequencyData.current.data.forEach((item, i) => {
      item.frequency = counts[i] / total;
    });

    setNormalizedMessage(result);

    // Tell the parent component so we re-render the graph data
    onUpdate();
  }, [frequencyData, message]);

  useEffect(() => {
    // Update the cipher message dynamically
    if (nodeRef.current) {
      for (const el of Array.from(
        nodeRef.current.querySelectorAll('span.encryptable'),
      )) {
        const letter = el.getAttribute('data-original-letter') || '';
        el.textContent = cipher.has(letter) ? cipher.get(letter) : letter;

        if (cipher.has(letter)) {
          el.classList.remove(moduleStyles.encryptedMessageLetter);
        } else {
          el.classList.add(moduleStyles.encryptedMessageLetter);
        }
      }
    }
  }, [state]);

  return useMemo(
    () => (
      <div className={moduleStyles.messageContainer} ref={nodeRef}>
        {normalizedMessage.map((letter, i) => {
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
              className={classNames(
                encryptable ? 'encryptable' : undefined,
                encrypted || !encryptable
                  ? undefined
                  : moduleStyles.encryptedMessageLetter,
              )}
            >
              {encrypted ? cipher.get(letter) : letter}
            </Typography>
          );
        })}
      </div>
    ),
    [normalizedMessage],
  );
};

export default Message;
