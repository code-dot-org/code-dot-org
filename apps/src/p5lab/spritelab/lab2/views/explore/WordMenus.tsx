// The sentence as prose above, with only the words chosen so far, and one
// slot's words at a time below in a carousel. The sentence's only blank is
// for the set on show.

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {useEffect, useState} from 'react';

import {
  chainedSlotIds,
  Choices,
  phraseFilled,
  Segment,
  Sentence,
  Slot,
  Word,
  WORD_DRAG_TYPE,
  wordFor,
} from './exploreSentences';
import {withPeriod} from './sentencePieces';

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

// An emoji is about this many letters wide.
const EMOJI_WIDTH_IN_LETTERS = 2;
const wordWidth = (w: Word) =>
  w.text.length + (w.emoji ? EMOJI_WIDTH_IN_LETTERS : 0);

// How many sets, in carousel order, the sentence keeps height for.
const RESERVED_SETS = 4;

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
  const [moveCount, setMoveCount] = useState(0);
  const [overSlotId, setOverSlotId] = useState<string | null>(null);
  const slot = slots[Math.min(index, slots.length - 1)];
  const goTo = (next: number) => {
    if (next === index) {
      return;
    }
    setDirection(next < index ? 'left' : 'right');
    setIndex(next);
    setMoveCount(n => n + 1);
  };

  const chained = chainedSlotIds(sentence);
  // The reserved sets each filled with their longest word, by text width.
  const longestChoices: Choices = Object.fromEntries(
    slots
      .slice(0, RESERVED_SETS)
      .map(s => [
        s.id,
        s.words.reduce((a, b) => (wordWidth(b) > wordWidth(a) ? b : a)).id,
      ])
  );
  const filled = (id: string) => !!wordFor(sentence, id, choices[id]);

  const choose = (slotId: string, wordId: string | undefined) => {
    const next = {...choices, [slotId]: wordId};
    // Clearing a chained word clears the ones after it.
    const chainedAt = chained.indexOf(slotId);
    if (!wordId && chainedAt >= 0) {
      chained.slice(chainedAt + 1).forEach(id => {
        next[id] = undefined;
      });
    }
    onChange(next);
    // Clearing a required word locks the carousel on that word's set.
    const at = slots.findIndex(s => s.id === slotId);
    if (!wordId && slots[at].required && at !== index) {
      goTo(at);
    }
  };

  // A chip takes a dragged word of its own slot.
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

  // A chained set opens once every chained set before it has its word.
  const isAvailable = (s: Slot) => {
    if (s.required) {
      return true;
    }
    if (anyRequiredMissing) {
      return false;
    }
    const at = chained.indexOf(s.id);
    return at <= 0 || chained.slice(0, at).every(filled);
  };
  const lastAvailable = slots.reduce(
    (last, s, i) => (isAvailable(s) ? i : last),
    0
  );
  // A set that closed while on show gives way to the last open one.
  useEffect(() => {
    if (index > lastAvailable) {
      setDirection('left');
      setIndex(lastAvailable);
    }
  }, [index, lastAvailable]);

  const mentions = (segments: Segment[], slotId: string): boolean =>
    segments.some(
      segment =>
        ('slot' in segment && segment.slot === slotId) ||
        ('phrase' in segment && mentions(segment.phrase, slotId))
    );

  // Empty slots and unfilled phrases leave nothing, except the set on show,
  // whose empty slot is a dimmed blank with its phrase dimmed around it.
  // Keys carry each piece's path: an index alone repeats across phrases.
  const renderSegments = (
    segments: Segment[],
    which: Choices,
    dimmed = false,
    path = ''
  ): React.ReactNode[] =>
    segments.flatMap((segment, i): React.ReactNode[] => {
      if ('text' in segment) {
        return [
          <span
            key={`${path}${i}`}
            className={classNames(dimmed && styles.dimmed)}
          >
            {segment.text}
          </span>,
        ];
      }
      if ('slot' in segment) {
        const s = sentence.slots[segment.slot];
        const word = wordFor(sentence, s.id, which[s.id]);
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
            {/* Jumps to the word's set while that set is open. */}
            <button
              type="button"
              className={styles.chipWord}
              aria-label={`${s.label}: ${word.text}. Show its words`}
              disabled={disabled || !canMove || !isAvailable(s)}
              onClick={() => goTo(slots.findIndex(x => x.id === s.id))}
            >
              {word.emoji && (
                <span className={styles.emoji} aria-hidden>
                  {word.emoji}
                </span>
              )}
              {word.text}
            </button>
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
      if (phraseFilled(sentence, segment.phrase, which)) {
        return renderSegments(segment.phrase, which, false, `${path}${i}.`);
      }
      return mentions(segment.phrase, slot.id)
        ? renderSegments(segment.phrase, which, true, `${path}${i}.`)
        : [];
    });

  return (
    <div className={styles.menus}>
      {/* A hidden longest form shares the cell, so the height holds. */}
      <div className={styles.sentenceStack}>
        <p className={styles.sentence} aria-live="polite">
          {withPeriod(renderSegments(sentence.segments, choices))}
        </p>
        <p
          className={classNames(styles.sentence, styles.sentenceGhost)}
          aria-hidden
        >
          {withPeriod(renderSegments(sentence.segments, longestChoices))}
        </p>
      </div>
      <div className={styles.carouselBox}>
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
          {/* Every set is laid out in one cell; only the one on show is
              visible. */}
          <div className={styles.sets}>
            {slots.map((set, i) => {
              const shown = i === index;
              return (
                <div
                  // Remounted on each arrival so the entrance replays.
                  key={shown ? `${set.id}-${moveCount}` : set.id}
                  className={classNames(
                    styles.set,
                    !shown && styles.setHidden,
                    shown &&
                      (direction === 'left'
                        ? styles.enterFromLeft
                        : styles.enterFromRight)
                  )}
                  role="group"
                  aria-label={`${set.label}${
                    set.required ? ' (pick one)' : ''
                  }`}
                  aria-hidden={!shown}
                >
                  <div className={styles.words}>
                    {set.words.map(word => {
                      const chosen = choices[set.id] === word.id;
                      return (
                        <button
                          key={word.id}
                          type="button"
                          className={classNames(
                            styles.word,
                            chosen && styles.chosen
                          )}
                          aria-pressed={chosen}
                          disabled={disabled}
                          draggable={!disabled}
                          onDragStart={e => {
                            e.dataTransfer.setData(
                              WORD_DRAG_TYPE,
                              JSON.stringify({slot: set.id, word: word.id})
                            );
                            e.dataTransfer.effectAllowed = 'copy';
                          }}
                          onClick={() =>
                            // A chosen word clicked again clears its slot.
                            choose(set.id, chosen ? undefined : word.id)
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
              );
            })}
          </div>
          <button
            type="button"
            className={styles.arrow}
            aria-label="Next words"
            disabled={!canMove || index >= lastAvailable}
            onClick={() => goTo(Math.min(lastAvailable, index + 1))}
          >
            <FontAwesomeV6Icon iconName="chevron-right" />
          </button>
        </div>
        <div className={styles.dots}>
          {slots.map((s, i) =>
            isAvailable(s) ? (
              <button
                key={s.id}
                type="button"
                className={classNames(
                  styles.dot,
                  i === index && styles.dotCurrent,
                  filled(s.id) && styles.dotFilled
                )}
                aria-label={`${s.label} words`}
                aria-current={i === index ? 'true' : undefined}
                disabled={!canMove}
                onClick={() => goTo(i)}
              />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
};

export default WordMenus;
