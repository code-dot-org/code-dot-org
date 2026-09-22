import React, {FC, KeyboardEvent, useEffect, useRef, useState} from 'react';

import styles from './svg-canvas.module.scss';

// Number of columns in the emoji grid — must match grid-template-columns in SCSS.
const COLS = 5;

interface EmojiPickerProps {
  emojis: string[];
  selectedEmoji: string;
  onEmojiChange: (emoji: string) => void;
  // Called when the user confirms a selection via keyboard (Enter/Space) or
  // presses Escape. The parent should move focus to the canvas so they can
  // start stamping immediately.
  onConfirm: () => void;
}

const EmojiPicker: FC<EmojiPickerProps> = ({
  emojis,
  selectedEmoji,
  onEmojiChange,
  onConfirm,
}) => {
  const [activeIdx, setActiveIdx] = useState(() =>
    Math.max(0, emojis.indexOf(selectedEmoji))
  );
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Move focus to the active emoji as soon as the picker mounts so keyboard
  // users land here automatically when they switch to the emoji tool.
  useEffect(() => {
    buttonRefs.current[activeIdx]?.focus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const moveTo = (next: number) => {
    const idx = Math.max(0, Math.min(emojis.length - 1, next));
    setActiveIdx(idx);
    buttonRefs.current[idx]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        moveTo(activeIdx + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        moveTo(activeIdx - 1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        moveTo(activeIdx + COLS);
        break;
      case 'ArrowUp':
        e.preventDefault();
        moveTo(activeIdx - COLS);
        break;
      case 'Escape':
        e.preventDefault();
        onConfirm();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={styles.emojiPicker}
      role="toolbar"
      aria-label="Choose an emoji to stamp"
      onKeyDown={handleKeyDown}
    >
      {emojis.map((emoji, i) => (
        <button
          key={emoji}
          ref={el => {
            buttonRefs.current[i] = el;
          }}
          type="button"
          aria-label={emoji}
          aria-pressed={selectedEmoji === emoji}
          tabIndex={i === activeIdx ? 0 : -1}
          onClick={e => {
            setActiveIdx(i);
            onEmojiChange(emoji);
            // Keyboard-triggered clicks (detail === 0) confirm the selection
            // and hand focus to the canvas. Mouse clicks just change the emoji
            // and leave focus in the picker so the user can keep browsing.
            if (e.detail === 0) onConfirm();
          }}
          className={`${styles.emojiPickerBtn}${
            selectedEmoji === emoji ? ` ${styles.emojiPickerBtnSelected}` : ''
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
