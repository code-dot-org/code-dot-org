// The sentence as it was sent, chosen words as chips with nothing to press:
// what the student reads back once a picture is on the left.

import classNames from 'classnames';
import React from 'react';

import {
  Choices,
  phraseFilled,
  Segment,
  Sentence,
  wordFor,
} from './exploreSentences';

import styles from './word-menus.module.scss';

interface SentenceReadOnlyProps {
  sentence: Sentence;
  choices: Choices;
}

const SentenceReadOnly: React.FunctionComponent<SentenceReadOnlyProps> = ({
  sentence,
  choices,
}) => {
  const render = (segments: Segment[]): React.ReactNode[] =>
    segments.flatMap((segment, i): React.ReactNode[] => {
      if ('text' in segment) {
        return [<span key={i}>{segment.text}</span>];
      }
      if ('slot' in segment) {
        const word = wordFor(sentence, segment.slot, choices[segment.slot]);
        return word
          ? [
              <span key={segment.slot} className={styles.chip}>
                {word.emoji && (
                  <span className={styles.emoji} aria-hidden>
                    {word.emoji}
                  </span>
                )}
                {word.text}
              </span>,
            ]
          : [];
      }
      return phraseFilled(sentence, segment.phrase, choices)
        ? render(segment.phrase)
        : [];
    });
  return (
    <p className={classNames(styles.sentence, styles.readOnly)}>
      {render(sentence.segments)}.
    </p>
  );
};

export default SentenceReadOnly;
