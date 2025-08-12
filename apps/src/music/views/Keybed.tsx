import classNames from 'classnames';
import React from 'react';

import musicI18n from '../locale';
import {getNoteName, isBlackKey} from '../utils/Notes';

import moduleStyles from './keybed.module.scss';

const keyId = 'keyId';

interface KeybedProps {
  numOctaves: number;
  startOctave: number;
  selectedNotes: number[];
  onPressKey: (note: number) => void;
  isDisabled: boolean;
  isVertical: boolean;
}

const Keybed: React.FunctionComponent<KeybedProps> = ({
  numOctaves,
  startOctave,
  selectedNotes,
  onPressKey,
  isDisabled,
  isVertical,
}) => {
  const keys = [];
  const startingNote = startOctave * 12;

  for (
    let currentNote = startingNote;
    currentNote < startingNote + numOctaves * 12;
    currentNote++
  ) {
    keys.push(
      <Key
        key={currentNote}
        type={isBlackKey(currentNote) ? 'black' : 'white'}
        isDisabled={isDisabled}
        isSelected={selectedNotes.includes(currentNote)}
        onClick={() => onPressKey(currentNote)}
        text={!isBlackKey(currentNote) ? getNoteName(currentNote) : undefined}
        isVertical={isVertical}
      />
    );
  }

  const enterExitKeyboard = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      // Focus the first element if it exists
      const keyList = document.querySelectorAll(
        `#keypad .${moduleStyles.key}`
      ) as NodeListOf<HTMLElement>;
      if (keyList.length > 0) {
        keyList[0].focus();
      }
    }
    if (event.key === 'Tab') {
      // Allows users to skip over the keypad
      (event.currentTarget as HTMLElement).blur();
    }
  };

  return (
    <div
      id="keypad"
      aria-label={musicI18n.keyPad()}
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      onKeyDown={enterExitKeyboard}
      className={classNames(
        moduleStyles.keybed,
        isVertical && moduleStyles.keybedVertical
      )}
    >
      {keys}
    </div>
  );
};

interface KeyProps {
  type: 'white' | 'black';
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
  text?: string;
  isVertical: boolean;
}

const Key: React.FunctionComponent<KeyProps> = ({
  type,
  isSelected,
  isDisabled,
  onClick,
  text,
  isVertical,
}: KeyProps) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keyElements = Array.from(
      document.querySelectorAll<HTMLElement>(`#${keyId}`)
    );
    const currentIndex = keyElements.indexOf(event.currentTarget);
    if (event.key === 'ArrowRight') {
      // Move focus to the next sibling
      const nextIndex = (currentIndex + 1) % keyElements.length;
      keyElements[nextIndex].focus();
    } else if (event.key === 'ArrowLeft') {
      // Move focus to the previous sibling
      const previousIndex =
        (currentIndex - 1 + keyElements.length) % keyElements.length;
      keyElements[previousIndex].focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      // Trigger the onClick handler for selection
      onClick();
      event.preventDefault();
      // Stop propagation to prevent enter setting focus on first element
      event.stopPropagation();
    } else if (event.key === 'Escape') {
      // Stop propagation to prevent escape from closing the entire popup
      event.stopPropagation();
      // Move focus back to the keyPad container
      const keypadContainer = document.getElementById('keypad');
      if (keypadContainer) {
        keypadContainer.focus();
      }
    } else if (event.key === 'Tab') {
      // Swallow the event so the focus doesn't leave the keybed
      event.stopPropagation();
    }
  };

  return (
    <div
      id={keyId}
      className={classNames(
        moduleStyles.key,
        isDisabled && moduleStyles.disabled,
        isSelected && moduleStyles.selected,
        type === 'white' && moduleStyles.whiteKey,
        type === 'black' && moduleStyles.blackKey,
        isVertical && type === 'white' && moduleStyles.whiteKeyVertical,
        isVertical && type === 'black' && moduleStyles.blackKeyVertical
      )}
      onClick={isSelected || !isDisabled ? onClick : undefined}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div
        className={classNames(
          moduleStyles.noteLabel,
          isVertical && moduleStyles.noteLabelVertical
        )}
      >
        {text}
      </div>
    </div>
  );
};

export default Keybed;
