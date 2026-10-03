// The sentence as prose above, reading only the words chosen so far, and
// one slot's words at a time below, in a carousel: arrows either side and a
// dot per slot. The other way to build the same sentence as SentenceBuilder:
// nothing in the sentence is ever blank, so "A dragon" reads as finished and
// each set of words is an offer to add to it.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useState} from 'react';

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

/** The slots to offer: the required ones first, then the rest, each group
    in the order the sentence reads them. */
export function slotsToOffer(sentence: Sentence): Slot[] {
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
  const slots = ids.map(id => sentence.slots[id]);
  return [...slots.filter(s => s.required), ...slots.filter(s => !s.required)];
}

const WordMenus: React.FunctionComponent<WordMenusProps> = ({
  sentence,
  choices,
  onChange,
  disabled,
  hint = 'Pick a word below to start.',
}) => {
  const slots = slotsToOffer(sentence);
  const [index, setIndex] = useState(0);
  const slot = slots[Math.min(index, slots.length - 1)];

  const choose = (slotId: string, wordId: string | undefined) =>
    onChange({...choices, [slotId]: wordId});

  const anyRequiredMissing = slots.some(
    s => s.required && !wordFor(sentence, s.id, choices[s.id])
  );

  // The sentence with only its chosen words: an empty slot and an unfilled
  // phrase leave nothing behind, not even a space.
  const renderSegments = (segments: Segment[]): React.ReactNode[] =>
    segments.flatMap((segment, i): React.ReactNode[] => {
      if ('text' in segment) {
        return [<span key={i}>{segment.text}</span>];
      }
      if ('slot' in segment) {
        const s = sentence.slots[segment.slot];
        const word = wordFor(sentence, s.id, choices[s.id]);
        if (!word) {
          return [];
        }
        return [
          <span key={s.id} className={styles.chip}>
            {word.text}
            <button
              type="button"
              className={styles.remove}
              aria-label={`Remove ${word.text}`}
              disabled={disabled}
              onClick={() => choose(s.id, undefined)}
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

  const chosenId = choices[slot.id];
  return (
    <div className={styles.menus}>
      <p className={styles.sentence} aria-live="polite">
        {anyRequiredMissing ? (
          <span className={styles.hint}>{hint}</span>
        ) : (
          <>{renderSegments(sentence.segments)}.</>
        )}
      </p>
      <div className={styles.carousel}>
        <button
          type="button"
          className={styles.arrow}
          aria-label="Previous words"
          disabled={disabled || index === 0}
          onClick={() => setIndex(i => Math.max(0, i - 1))}
        >
          <FontAwesomeV6Icon iconName="chevron-left" />
        </button>
        <div
          className={styles.set}
          role="group"
          aria-label={`${slot.label}${slot.required ? ' (pick one)' : ''}`}
        >
          <span className={styles.setLabel}>
            {slot.label}
            {slot.required && (
              <span className={styles.required}> · pick one</span>
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
        <button
          type="button"
          className={styles.arrow}
          aria-label="Next words"
          disabled={disabled || index >= slots.length - 1}
          onClick={() => setIndex(i => Math.min(slots.length - 1, i + 1))}
        >
          <FontAwesomeV6Icon iconName="chevron-right" />
        </button>
      </div>
      <div className={styles.dots}>
        {slots.map((s, i) => (
          <button
            key={s.id}
            type="button"
            className={classNames(
              styles.dot,
              i === index && styles.dotCurrent,
              wordFor(sentence, s.id, choices[s.id]) && styles.dotFilled
            )}
            aria-label={`${s.label} words`}
            aria-current={i === index ? 'true' : undefined}
            disabled={disabled}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default WordMenus;
