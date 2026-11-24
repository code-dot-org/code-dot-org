// The sentence read back: chosen words as chips with nothing to press.

import classNames from 'classnames';
import React from 'react';

import {useLocalization} from '@cdo/apps/localization';

import {
  isEnglish,
  readOnlyTemplate,
  translateSentence,
} from './sentenceLocalization';
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
  const locale = useLocalization();
  const renderSlot = (slotId: string): React.ReactNode[] => {
    const word = wordFor(sentence, slotId, choices[slotId]);
    return word
      ? [
          <WordChip key={slotId} sentence={sentence} slotId={slotId}>
            <WordText word={word} slot={sentence.slots[slotId]} />
          </WordChip>,
        ]
      : [];
  };
  // Keys carry each piece's path: an index alone repeats across phrases.
  const render = (segments: Segment[], path = ''): React.ReactNode[] =>
    segments.flatMap((segment, i): React.ReactNode[] => {
      if ('text' in segment) {
        return [<span key={`${path}${i}`}>{segment.text}</span>];
      }
      if ('slot' in segment) {
        return renderSlot(segment.slot);
      }
      return phraseFilled(sentence, segment.phrase, choices)
        ? render(segment.phrase, `${path}${i}.`)
        : [];
    });
  return (
    <p
      className={classNames(styles.sentence, styles.readOnly)}
      data-notranslate
    >
      {isEnglish(locale)
        ? withPeriod(render(sentence.segments))
        : translateSentence(readOnlyTemplate(sentence, choices)).flatMap(
            (piece, i) =>
              'slot' in piece
                ? renderSlot(piece.slot)
                : [<span key={`text${i}`}>{piece.text}</span>]
          )}
    </p>
  );
};

export default SentenceReadOnly;
