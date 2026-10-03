// The sentence as prose above, reading only the words chosen so far, and
// a row of words per slot below to choose from. The other way to build the
// same sentence as SentenceBuilder: nothing in the sentence is ever blank,
// so "A dragon" reads as finished and each row is an offer to add to it.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import {
  Choices,
  phraseFilled,
  Segment,
  Sentence,
  Slot,
  wordFor,
} from './exploreSentences';

import styles from './word-menus.module.scss';

interface WordMenusProps {
  sentence: Sentence;
  choices: Choices;
  onChange: (choices: Choices) => void;
  disabled?: boolean;
  /** Shown as the sentence until a required word is chosen. */
  hint?: string;
}

/** The slots in the order the sentence reads them. */
export function slotsInOrder(sentence: Sentence): Slot[] {
  const ids: string[] = [];
  const walk = (segments: Segment[]) =>
    segments.forEach(segment => {
      if ('slot' in segment) {
        ids.push(segment.slot);
      } else if ('phrase' in segment) {
        walk(segment.phrase);
      }
    });
  walk(sentence.segments);
  return ids.map(id => sentence.slots[id]);
}

const WordMenus: React.FunctionComponent<WordMenusProps> = ({
  sentence,
  choices,
  onChange,
  disabled,
  hint = 'Pick a word below to start.',
}) => {
  const choose = (slotId: string, wordId: string | undefined) =>
    onChange({...choices, [slotId]: wordId});

  const anyRequiredMissing = Object.values(sentence.slots).some(
    slot => slot.required && !wordFor(sentence, slot.id, choices[slot.id])
  );

  // The sentence with only its chosen words: an empty slot and an unfilled
  // phrase leave nothing behind, not even a space.
  const renderSegments = (segments: Segment[]): React.ReactNode[] =>
    segments.flatMap((segment, i) => {
      if ('text' in segment) {
        return [<span key={i}>{segment.text}</span>];
      }
      if ('slot' in segment) {
        const slot = sentence.slots[segment.slot];
        const word = wordFor(sentence, slot.id, choices[slot.id]);
        if (!word) {
          return [];
        }
        return [
          <span key={slot.id} className={styles.chip}>
            {word.text}
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${word.text}`}
              disabled={disabled}
              onClick={() => choose(slot.id, undefined)}
            >
              <FontAwesomeV6Icon iconName="xmark" />
            </button>
          </span>,
        ];
      }
      return phraseFilled(sentence, segment.phrase, choices)
        ? renderSegments(segment.phrase)
        : [];
    });

  return (
    <div className={styles.menus}>
      <p className={styles.sentence} aria-live="polite">
        {anyRequiredMissing ? (
          <span className={styles.hint}>{hint}</span>
        ) : (
          <>{renderSegments(sentence.segments)}.</>
        )}
      </p>
      {slotsInOrder(sentence).map(slot => {
        const chosenId = choices[slot.id];
        return (
          <div
            key={slot.id}
            className={styles.row}
            role="group"
            aria-label={`${slot.label}${slot.required ? ' (pick one)' : ''}`}
          >
            <span className={styles.rowLabel}>
              {slot.label}
              {slot.required && (
                <span className={styles.required}> pick one</span>
              )}
            </span>
            <div className={styles.words}>
              {slot.words.map(word => {
                const chosen = chosenId === word.id;
                return (
                  <button
                    key={word.id}
                    type="button"
                    className={classNames(styles.word, chosen && styles.chosen)}
                    aria-pressed={chosen}
                    disabled={disabled}
                    onClick={() =>
                      // A chosen optional word clicked again clears its slot.
                      choose(
                        slot.id,
                        chosen && !slot.required ? undefined : word.id
                      )
                    }
                  >
                    {word.text}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WordMenus;
