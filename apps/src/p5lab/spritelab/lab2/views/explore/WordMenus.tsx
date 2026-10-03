// The sentence as prose above, reading only the words chosen so far, and
// one slot's words at a time below, in a carousel: arrows either side and a
// dot per slot. The other way to build the same sentence as SentenceBuilder:
// the only blank the sentence ever shows is for the set on show, so "A
// dragon" reads as finished and each set of words is an offer to add to it.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useState} from 'react';

import {
  Choices,
  phraseFilled,
  Segment,
  Sentence,
  Slot,
  WORD_DRAG_TYPE,
  wordFor,
} from './exploreSentences';

import styles from './word-menus.module.scss';

interface WordMenusProps {
  sentence: Sentence;
  choices: Choices;
  onChange: (choices: Choices) => void;
  disabled?: boolean;
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
}) => {
  const slots = slotsToOffer(sentence);
  const [index, setIndex] = useState(0);
  // Which way the last move went, so the new set eases in from that side.
  const [direction, setDirection] = useState<'left' | 'right'>('right');
  const [overSlotId, setOverSlotId] = useState<string | null>(null);
  const slot = slots[Math.min(index, slots.length - 1)];
  const goTo = (next: number) => {
    setDirection(next < index ? 'left' : 'right');
    setIndex(next);
  };

  const choose = (slotId: string, wordId: string | undefined) => {
    onChange({...choices, [slotId]: wordId});
    // Clearing a required word locks the carousel again, so bring the
    // student back to the set the word came from.
    const at = slots.findIndex(s => s.id === slotId);
    if (!wordId && slots[at].required && at !== index) {
      goTo(at);
    }
  };

  // A chip in the sentence takes a word dragged from the set on show, when
  // it is that slot's word.
  const dropHandlers = (slotId: string) => ({
    onDragOver: (e: React.DragEvent) => {
      if (e.dataTransfer.types.includes(WORD_DRAG_TYPE)) {
        e.preventDefault();
        setOverSlotId(slotId);
      }
    },
    onDragLeave: () => setOverSlotId(null),
    onDrop: (e: React.DragEvent) => {
      setOverSlotId(null);
      try {
        const data = JSON.parse(e.dataTransfer.getData(WORD_DRAG_TYPE));
        if (data.slot === slotId) {
          e.preventDefault();
          choose(slotId, data.word);
        }
      } catch {
        // Not a word.
      }
    },
  });

  const anyRequiredMissing = slots.some(
    s => s.required && !wordFor(sentence, s.id, choices[s.id])
  );
  // The required set holds the carousel until its word is chosen.
  const canMove = !disabled && !anyRequiredMissing;

  const mentions = (segments: Segment[], slotId: string): boolean =>
    segments.some(
      segment =>
        ('slot' in segment && segment.slot === slotId) ||
        ('phrase' in segment && mentions(segment.phrase, slotId))
    );

  // The sentence with only its chosen words: an empty slot and an unfilled
  // phrase leave nothing behind, not even a space. The one exception is the
  // set on show: its empty slot appears as a dimmed blank chip, with its
  // phrase dimmed around it, so the student sees where the word would go.
  const renderSegments = (
    segments: Segment[],
    dimmed = false
  ): React.ReactNode[] =>
    segments.flatMap((segment, i): React.ReactNode[] => {
      if ('text' in segment) {
        return [
          <span key={i} className={classNames(dimmed && styles.dimmed)}>
            {segment.text}
          </span>,
        ];
      }
      if ('slot' in segment) {
        const s = sentence.slots[segment.slot];
        const word = wordFor(sentence, s.id, choices[s.id]);
        if (!word) {
          return s.id === slot.id
            ? [
                <span
                  key={s.id}
                  className={classNames(
                    styles.chip,
                    styles.placeholder,
                    overSlotId === s.id && styles.dropTarget
                  )}
                  aria-hidden
                  {...dropHandlers(s.id)}
                >
                  {'\u00a0'}
                </span>,
              ]
            : [];
        }
        return [
          <span
            key={s.id}
            className={classNames(
              styles.chip,
              overSlotId === s.id && styles.dropTarget
            )}
            {...dropHandlers(s.id)}
          >
            {word.emoji && (
              <span className={styles.emoji} aria-hidden>
                {word.emoji}
              </span>
            )}
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
      if (phraseFilled(sentence, segment.phrase, choices)) {
        return renderSegments(segment.phrase);
      }
      return mentions(segment.phrase, slot.id)
        ? renderSegments(segment.phrase, true)
        : [];
    });

  const chosenId = choices[slot.id];
  return (
    <div className={styles.menus}>
      <p className={styles.sentence} aria-live="polite">
        {renderSegments(sentence.segments)}.
      </p>
      <div className={styles.carousel}>
        <button
          type="button"
          className={styles.arrow}
          aria-label="Previous words"
          disabled={!canMove || index === 0}
          onClick={() => goTo(Math.max(0, index - 1))}
        >
          <FontAwesomeV6Icon iconName="chevron-left" />
        </button>
        <div
          // Keyed on the slot so a new set mounts afresh and plays its entrance.
          key={slot.id}
          className={classNames(
            styles.set,
            direction === 'left' ? styles.enterFromLeft : styles.enterFromRight
          )}
          role="group"
          aria-label={`${slot.label}${slot.required ? ' (pick one)' : ''}`}
        >
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
                  draggable={!disabled}
                  onDragStart={e => {
                    e.dataTransfer.setData(
                      WORD_DRAG_TYPE,
                      JSON.stringify({slot: slot.id, word: word.id})
                    );
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() =>
                    // A chosen optional word clicked again clears its slot.
                    choose(
                      slot.id,
                      chosen && !slot.required ? undefined : word.id
                    )
                  }
                >
                  {word.emoji && (
                    <span className={styles.emoji} aria-hidden>
                      {word.emoji}
                    </span>
                  )}
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
          disabled={!canMove || index >= slots.length - 1}
          onClick={() => goTo(Math.min(slots.length - 1, index + 1))}
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
            disabled={!canMove}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
};

export default WordMenus;
