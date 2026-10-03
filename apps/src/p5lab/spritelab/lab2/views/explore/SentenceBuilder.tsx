// A sentence of word slots. Clicking a slot opens its tray of words below
// the sentence; clicking a word puts it in the slot, swapping out what was
// there, and closes the tray. A word can also be dragged from the tray onto
// its slot. A filled slot wears its word as a chip with an x that empties
// it. A phrase around an empty slot is dimmed: the sentence reads without
// it.

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

import styles from './sentence-builder.module.scss';

interface SentenceBuilderProps {
  sentence: Sentence;
  choices: Choices;
  onChange: (choices: Choices) => void;
  disabled?: boolean;
}

const SentenceBuilder: React.FunctionComponent<SentenceBuilderProps> = ({
  sentence,
  choices,
  onChange,
  disabled,
}) => {
  const [openSlotId, setOpenSlotId] = useState<string | null>(null);
  const [overSlotId, setOverSlotId] = useState<string | null>(null);
  const openSlot = openSlotId ? sentence.slots[openSlotId] : undefined;

  const choose = (slotId: string, wordId: string | undefined) => {
    onChange({...choices, [slotId]: wordId});
    setOpenSlotId(null);
  };

  const dragData = (
    e: React.DragEvent
  ): {slot: string; word: string} | null => {
    try {
      return JSON.parse(e.dataTransfer.getData(WORD_DRAG_TYPE));
    } catch {
      return null;
    }
  };

  const renderSlot = (slot: Slot) => {
    const word = wordFor(sentence, slot.id, choices[slot.id]);
    const open = openSlotId === slot.id;
    return (
      <span
        key={slot.id}
        className={classNames(
          styles.slot,
          word && styles.filled,
          open && styles.open,
          overSlotId === slot.id && styles.dropTarget
        )}
        onDragOver={e => {
          if (e.dataTransfer.types.includes(WORD_DRAG_TYPE)) {
            e.preventDefault();
            setOverSlotId(slot.id);
          }
        }}
        onDragLeave={() => setOverSlotId(null)}
        onDrop={e => {
          const data = dragData(e);
          setOverSlotId(null);
          if (data && data.slot === slot.id) {
            e.preventDefault();
            choose(slot.id, data.word);
          }
        }}
      >
        <button
          type="button"
          className={styles.slotButton}
          aria-expanded={open}
          aria-label={
            word
              ? `${slot.label}: ${word.text}. Change it`
              : `Choose a ${slot.label}${slot.required ? '' : ' (optional)'}`
          }
          disabled={disabled}
          onClick={() => setOpenSlotId(open ? null : slot.id)}
        >
          {/* An empty slot is a blank to fill; its label is for the screen
              reader only. */}
          {word ? (
            <>
              {word.emoji && (
                <span className={styles.emoji} aria-hidden>
                  {word.emoji}
                </span>
              )}
              {word.text}
            </>
          ) : (
            '\u00a0'
          )}
        </button>
        {word && (
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remove ${word.text}`}
            disabled={disabled}
            onClick={() => choose(slot.id, undefined)}
          >
            <FontAwesomeV6Icon iconName="xmark" />
          </button>
        )}
      </span>
    );
  };

  const renderSegments = (segments: Segment[]): React.ReactNode[] =>
    segments.map((segment, i) => {
      if ('text' in segment) {
        return <span key={i}>{segment.text}</span>;
      }
      if ('slot' in segment) {
        return renderSlot(sentence.slots[segment.slot]);
      }
      return (
        <span
          key={i}
          className={classNames(
            styles.phrase,
            !phraseFilled(sentence, segment.phrase, choices) && styles.dimmed
          )}
        >
          {renderSegments(segment.phrase)}
        </span>
      );
    });

  return (
    <div className={styles.builder}>
      <p className={styles.sentence}>{renderSegments(sentence.segments)}</p>
      {openSlot && (
        <div
          className={styles.tray}
          role="group"
          aria-label={`Words for ${openSlot.label}`}
        >
          {openSlot.words.map(word => {
            const chosen = choices[openSlot.id] === word.id;
            return (
              <button
                key={word.id}
                type="button"
                className={classNames(styles.chip, chosen && styles.chosen)}
                aria-pressed={chosen}
                disabled={disabled}
                draggable={!disabled}
                onDragStart={e => {
                  e.dataTransfer.setData(
                    WORD_DRAG_TYPE,
                    JSON.stringify({slot: openSlot.id, word: word.id})
                  );
                  e.dataTransfer.effectAllowed = 'copy';
                }}
                onClick={() => choose(openSlot.id, word.id)}
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
      )}
    </div>
  );
};

export default SentenceBuilder;
