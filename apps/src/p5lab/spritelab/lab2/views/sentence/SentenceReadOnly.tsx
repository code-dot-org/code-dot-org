// The sentence read back: chosen words as chips with nothing to press.

import classNames from 'classnames';
import React from 'react';

import {withPeriod, WordChip, WordText} from './sentencePieces';
import {Choices, phraseFilled, Segment, Sentence, wordFor} from './sentences';

import styles from './word-menus.module.scss';

interface SentenceReadOnlyProps {
  sentence: Sentence;
  choices: Choices;
}

const SentenceReadOnly: React.FunctionComponent<SentenceReadOnlyProps> = ({
  sentence,
  choices,
}) => {
  // Keys carry each piece's path: an index alone repeats across phrases.
  const render = (segments: Segment[], path = ''): React.ReactNode[] =>
    segments.flatMap((segment, i): React.ReactNode[] => {
      if ('text' in segment) {
        return [<span key={`${path}${i}`}>{segment.text}</span>];
      }
      if ('slot' in segment) {
        const word = wordFor(sentence, segment.slot, choices[segment.slot]);
        return word
          ? [
              <WordChip
                key={segment.slot}
                sentence={sentence}
                slotId={segment.slot}
              >
                <WordText word={word} />
              </WordChip>,
            ]
          : [];
      }
      return phraseFilled(sentence, segment.phrase, choices)
        ? render(segment.phrase, `${path}${i}.`)
        : [];
    });
  return (
    <p className={classNames(styles.sentence, styles.readOnly)}>
      {withPeriod(render(sentence.segments))}
    </p>
  );
};

export default SentenceReadOnly;
