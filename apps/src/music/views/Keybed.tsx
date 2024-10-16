import classNames from 'classnames';
import React from 'react';

import {getNoteName, isBlackKey} from '../utils/Notes';

import moduleStyles from './keybed.module.scss';

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

  return (
    <div
      id="keypad"
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
  return (
    <div
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
